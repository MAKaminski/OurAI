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

/** Providers that can appear in a company's ranked order, in the default order. */
export const MODEL_PROVIDERS: ModelProviderName[] = PROVIDER_KEYS.map((p) => p.provider);

/** Human labels for the provider ids (UI + messages). */
export const PROVIDER_LABEL: Record<ModelProviderName, string> = {
  deepseek: 'DeepSeek',
  kimi: 'Kimi (Moonshot)',
  anthropic: 'Claude (Anthropic)',
};

/**
 * Normalize a saved/requested provider order into a complete, valid list: keep
 * known providers in the given order, drop unknowns, and append any known
 * providers that were omitted (in default order) so a newly-added provider still
 * works even if it isn't in an older saved preference.
 */
export function normalizeProviderOrder(
  order: readonly string[] | null | undefined,
): ModelProviderName[] {
  const known = new Set(MODEL_PROVIDERS);
  const seen = new Set<ModelProviderName>();
  const result: ModelProviderName[] = [];
  for (const p of order ?? []) {
    if (known.has(p as ModelProviderName) && !seen.has(p as ModelProviderName)) {
      result.push(p as ModelProviderName);
      seen.add(p as ModelProviderName);
    }
  }
  for (const p of MODEL_PROVIDERS) if (!seen.has(p)) result.push(p);
  return result;
}

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
const SECRET_KEY_FOR: Record<ModelProviderName, string> = Object.fromEntries(
  PROVIDER_KEYS.map((p) => [p.provider, p.secretKey]),
) as Record<ModelProviderName, string>;

export async function resolveCredentials(
  supabase: SupabaseClient,
  userId: string,
  order?: readonly string[] | null,
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
  // Resolve in the (normalized) preferred order — the company's ranking, or the
  // default when none is given.
  for (const provider of normalizeProviderOrder(order)) {
    const secretKey = SECRET_KEY_FOR[provider];
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
  order: readonly string[] | null,
  attempt: (cred: ModelCredential) => Promise<T>,
): Promise<T> {
  const creds = await resolveCredentials(supabase, userId, order);
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

export class GithubTokenMissingError extends Error {
  constructor() {
    super(
      'No GitHub token configured. Add a GitHub personal access token (with repo ' +
        'access) on the Connections page (/connections) to open a build PR.',
    );
    this.name = 'GithubTokenMissingError';
  }
}

/**
 * The caller's GitHub PAT from the vault (user-scoped `secrets`, key
 * `GITHUB_TOKEN`), decrypted; env fallback for local/dev. Throws
 * `GithubTokenMissingError` when absent.
 */
export async function resolveGithubToken(
  supabase: SupabaseClient,
  userId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('secrets')
    .select('key,encrypted_value,value')
    .eq('scope', 'user')
    .eq('user_id', userId)
    .eq('key', 'GITHUB_TOKEN')
    .maybeSingle();
  if (error) throw new Error(`resolve github token failed: ${error.message}`);
  const row = data as SecretRow | null;
  const fromVault = row?.encrypted_value ? decryptSecret(row.encrypted_value) : (row?.value ?? '');
  const token = fromVault || process.env.GITHUB_TOKEN || '';
  if (!token) throw new GithubTokenMissingError();
  return token;
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
