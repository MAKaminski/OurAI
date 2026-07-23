import {
  decryptSecret,
  encryptSecret,
  encryptionConfigured,
  maskSecret,
} from '@/lib/crypto/secrets';

/** A setting as returned to the client — sensitive values are masked, never raw. */
export interface CompanySetting {
  key: string;
  isSensitive: boolean;
  /** Plaintext for non-sensitive; a masked preview for sensitive. */
  display: string;
  updatedAt: string;
}

export interface SettingsBackend {
  configured: boolean;
  reason?: string;
}

interface SupabaseRow {
  key: string;
  value: string | null;
  encrypted_value: string | null;
  is_sensitive: boolean;
  updated_at: string;
}

function supabase(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function settingsBackendStatus(): SettingsBackend {
  if (!supabase()) {
    return {
      configured: false,
      reason: 'Supabase is not configured (SUPABASE_URL / service key).',
    };
  }
  return { configured: true };
}

function headers(serviceKey: string, extra: Record<string, string> = {}): HeadersInit {
  return {
    'Content-Type': 'application/json',
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    // Target the isolated OurAI schema (reads use Accept-Profile, writes use
    // Content-Profile) so PostgREST never touches `public`.
    'Accept-Profile': 'ourai',
    'Content-Profile': 'ourai',
    ...extra,
  };
}

const base = 'company_settings';

export async function listSettings(companyId: string): Promise<CompanySetting[]> {
  const sb = supabase();
  if (!sb) return [];
  const url = `${sb.url}/rest/v1/${base}?company_id=eq.${companyId}&select=key,value,encrypted_value,is_sensitive,updated_at&order=key`;
  const res = await fetch(url, { headers: headers(sb.key), cache: 'no-store' });
  if (!res.ok) throw new Error(`list settings failed: ${res.status}`);
  const rows = (await res.json()) as SupabaseRow[];
  return rows.map((row) => ({
    key: row.key,
    isSensitive: row.is_sensitive,
    display: row.is_sensitive
      ? row.encrypted_value
        ? maskSecret(decryptSecret(row.encrypted_value))
        : '••••'
      : (row.value ?? ''),
    updatedAt: row.updated_at,
  }));
}

export async function upsertSetting(
  companyId: string,
  key: string,
  value: string,
  isSensitive: boolean,
): Promise<void> {
  const sb = supabase();
  if (!sb) throw new Error('settings backend not configured');
  if (isSensitive && !encryptionConfigured()) {
    throw new Error('SETTINGS_ENCRYPTION_KEY is not set — cannot store sensitive values.');
  }
  const row = {
    company_id: companyId,
    key,
    value: isSensitive ? null : value,
    encrypted_value: isSensitive ? encryptSecret(value) : null,
    is_sensitive: isSensitive,
    updated_at: new Date().toISOString(),
  };
  const res = await fetch(`${sb.url}/rest/v1/${base}?on_conflict=company_id,key`, {
    method: 'POST',
    headers: headers(sb.key, { Prefer: 'resolution=merge-duplicates' }),
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`upsert setting failed: ${res.status}`);
}

export async function deleteSetting(companyId: string, key: string): Promise<void> {
  const sb = supabase();
  if (!sb) throw new Error('settings backend not configured');
  const url = `${sb.url}/rest/v1/${base}?company_id=eq.${companyId}&key=eq.${encodeURIComponent(key)}`;
  const res = await fetch(url, { method: 'DELETE', headers: headers(sb.key) });
  if (!res.ok) throw new Error(`delete setting failed: ${res.status}`);
}
