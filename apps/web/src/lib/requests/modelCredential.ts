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
export async function resolveCredential(
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

/** Strip an accidental ```json fence so JSON.parse succeeds on model output. */
export function stripFence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith('```')) return trimmed;
  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}
