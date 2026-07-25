import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createProvider,
  defaultModelId,
  type ChatMessage,
  type ModelProviderName,
  type TokenUsage,
} from '@ourai/model-gateway';
import { kpiAgentOutputSchema, type KpiInput } from '@ourai/shared';
import { stripFence, withModelFallback } from './modelCredential';

export { ModelKeyMissingError } from './modelCredential';

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
  order?: readonly string[] | null,
  signal?: AbortSignal,
): Promise<KpiAgentResult> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt(request.title, request.body) },
  ];

  // Try each configured provider in the company's ranked order (fallback on a
  // dead/errored key).
  return withModelFallback(supabase, userId, order ?? null, async ({ provider, apiKey }) => {
    const modelId = defaultModelId(provider);
    const client = createProvider({ provider, apiKey });
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
  });
}
