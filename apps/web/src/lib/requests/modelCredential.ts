import type { SupabaseClient } from '@supabase/supabase-js';
import type { ModelProviderName } from '@ourai/model-gateway';
import { decryptSecret } from '@/lib/crypto/secrets';

/**
 * Chat/completions providers whose `chat()` is implemented, in preference order.
 * Each maps a vault secret key → gateway provider. DeepSeek is the default (best
 * cost/quality for these stages); Kimi and Anthropic (Claude) are also wired.
 */
export const PROVIDER_KEYS: ReadonlyArray<{ provider: ModelProviderName; secretKey: string }> = [
  { provider: 'deepseek', secretKey: 'DEEPSEEK_API_KEY' },
  { provider: 'kimi', secretKey: 'MOONSHOT_API_KEY' },
  { provider: 'anthropic', secretKey: 'ANTHROPIC_API_KEY' },
];

export class ModelKeyMissingError extends Error {
  constructor() {
    super(
      'No model API key configured. Add a DeepSeek, Kimi, or Claude key on the ' +
        'Connections page (/connections) to run this stage.',
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
 * user-scoped vault key (RLS-scoped `secrets`), falling back to a deployment env
 * var for local/dev. Throws `ModelKeyMissingError` when nothing is found.
 */
export interface ModelCredential {
  provider: ModelProviderName;
  apiKey: string;
}

/**
 * All usable model credentials for the caller, in preference order (cheapest
 * capable first). Prefers each provider's user-scoped vault key, then a
 * deployment env var. The agents try these in order and fall through to the next
 * on failure, so a dead key (e.g. a 402 out-of-balance DeepSeek account) doesn't
 * block a request when another provider key is configured. Empty when none set.
 */
export async function resolveCredentials(
  supabase: SupabaseClient,
  userId: string,
): Promise<ModelCredential[]> {
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
  const creds: ModelCredential[] = [];
  for (const { provider, secretKey } of PROVIDER_KEYS) {
    const row = rows.find((r) => r.key === secretKey);
    const fromVault = row?.encrypted_value
      ? decryptSecret(row.encrypted_value)
      : (row?.value ?? '');
    const apiKey = fromVault || process.env[secretKey] || '';
    if (apiKey) creds.push({ provider, apiKey });
  }
  return creds;
}

/**
 * Run `attempt` against each configured credential in order, returning the first
 * success. If every provider fails, throws the last error; if none is configured,
 * throws `ModelKeyMissingError`. This is what makes provider fallback work.
 */
export async function withModelFallback<T>(
  supabase: SupabaseClient,
  userId: string,
  attempt: (cred: ModelCredential) => Promise<T>,
): Promise<T> {
  const creds = await resolveCredentials(supabase, userId);
  if (creds.length === 0) throw new ModelKeyMissingError();
  let lastErr: unknown;
  for (const cred of creds) {
    try {
      return await attempt(cred);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/** Strip an accidental ```json fence so JSON.parse succeeds on model output. */
export function stripFence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith('```')) return trimmed;
  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}
