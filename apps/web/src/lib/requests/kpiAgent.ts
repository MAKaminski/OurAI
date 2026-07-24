import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createProvider,
  defaultModelId,
  type ChatMessage,
  type ModelProviderName,
  type TokenUsage,
} from '@ourai/model-gateway';
import { kpiAgentOutputSchema, type KpiInput } from '@ourai/shared';
import { decryptSecret } from '@/lib/crypto/secrets';

/**
 * The chat/completions providers whose `chat()` is implemented today, in
 * preference order. Anthropic is intentionally excluded — its native provider
 * is still a stub (Phase 1b). Each maps a vault secret key → gateway provider.
 */
const PROVIDER_KEYS: ReadonlyArray<{ provider: ModelProviderName; secretKey: string }> = [
  { provider: 'deepseek', secretKey: 'DEEPSEEK_API_KEY' },
  { provider: 'kimi', secretKey: 'MOONSHOT_API_KEY' },
];

export class ModelKeyMissingError extends Error {
  constructor() {
    super(
      'No model API key configured. Add a DeepSeek or Kimi key on the Connections ' +
        'page (/connections) to generate KPIs.',
    );
    this.name = 'ModelKeyMissingError';
  }
}

interface SecretRow {
  key: string;
  encrypted_value: string | null;
  value: string | null;
}

/**
 * Resolve a usable model credential for the caller. Prefers the caller's
 * user-scoped vault key (RLS-scoped `secrets`), falling back to a deployment
 * env var for local/dev. Throws `ModelKeyMissingError` when nothing is found.
 */
async function resolveCredential(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ provider: ModelProviderName; apiKey: string }> {
  const { data, error } = await supabase
    .from('secrets')
    .select('key,encrypted_value,value')
    .eq('scope', 'user')
    .eq('user_id', userId)
    .in(
      'key',
      PROVIDER_KEYS.map((p) => p.secretKey),
    );
  if (error) throw new Error(`resolve model key failed: ${error.message}`);

  const rows = (data ?? []) as SecretRow[];
  for (const { provider, secretKey } of PROVIDER_KEYS) {
    const row = rows.find((r) => r.key === secretKey);
    if (row) {
      const apiKey = row.encrypted_value ? decryptSecret(row.encrypted_value) : (row.value ?? '');
      if (apiKey) return { provider, apiKey };
    }
    const envKey = process.env[secretKey];
    if (envKey) return { provider, apiKey: envKey };
  }
  throw new ModelKeyMissingError();
}

const SYSTEM_PROMPT =
  'You are a senior product manager. Given a product request, propose 3–6 ' +
  'concrete, measurable product KPIs. Each KPI needs a short name, a specific ' +
  'measurable target (include a number and a timeframe), and a one-sentence ' +
  'rationale. Respond with ONLY a JSON object of the form ' +
  '{"kpis":[{"name":string,"target":string,"rationale":string}]} and no prose, ' +
  'markdown, or code fences.';

function userPrompt(title: string, body: string | null): string {
  return `Request title: ${title}\n\nRequest details:\n${body?.trim() || '(none provided)'}`;
}

/** Strip an accidental ```json fence so JSON.parse succeeds. */
function stripFence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith('```')) return trimmed;
  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

export interface KpiAgentResult {
  kpis: KpiInput[];
  provider: ModelProviderName;
  modelId: string;
  usage: TokenUsage;
}

/**
 * Run the KPI proposal agent for a request. Server-side only: resolves a model
 * key from the vault, calls the model gateway, and parses the strict-JSON
 * result into validated KPIs. Never persists — the caller (store) writes rows.
 */
export async function runKpiAgent(
  supabase: SupabaseClient,
  userId: string,
  request: { title: string; body: string | null },
  signal?: AbortSignal,
): Promise<KpiAgentResult> {
  const { provider, apiKey } = await resolveCredential(supabase, userId);
  const modelId = defaultModelId(provider);
  const client = createProvider({ provider, apiKey });

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt(request.title, request.body) },
  ];

  const res = await client.chat({ model: modelId, messages, temperature: 0.3, signal });

  const raw = res.message.content ?? '';
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(stripFence(raw));
  } catch {
    throw new Error('model did not return valid JSON for KPIs');
  }
  const parsed = kpiAgentOutputSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error(`model KPI output failed validation: ${parsed.error.message}`);
  }

  return { kpis: parsed.data.kpis, provider, modelId, usage: res.usage };
}
