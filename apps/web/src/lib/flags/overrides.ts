import { resolveSupabaseUrl } from '@/lib/supabase/env';

/**
 * Admin-controlled feature-flag overrides (`ourai.feature_flag_overrides`).
 * Read on the server-side flag-evaluation path (ahead of PostHog); written only
 * by the admin API. Uses the service-role key like the settings store — reads
 * here must never throw, so every failure degrades to "no override" (null).
 */
function serviceClient(): { url: string; key: string } | null {
  const url = resolveSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

function headers(serviceKey: string, extra: Record<string, string> = {}): HeadersInit {
  return {
    'Content-Type': 'application/json',
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Accept-Profile': 'ourai',
    'Content-Profile': 'ourai',
    ...extra,
  };
}

const base = 'feature_flag_overrides';

/** The override for one flag key, or null when unset / backend unavailable. */
export async function getFlagOverride(key: string): Promise<boolean | null> {
  const sb = serviceClient();
  if (!sb) return null;
  try {
    const url = `${sb.url}/rest/v1/${base}?key=eq.${encodeURIComponent(key)}&select=enabled`;
    const res = await fetch(url, { headers: headers(sb.key), cache: 'no-store' });
    if (!res.ok) return null;
    const rows = (await res.json()) as { enabled: boolean }[];
    const first = rows[0];
    return first ? first.enabled : null;
  } catch {
    return null;
  }
}

/** All overrides as a { key: enabled } map (admin panel). Empty on failure. */
export async function getAllOverrides(): Promise<Record<string, boolean>> {
  const sb = serviceClient();
  if (!sb) return {};
  try {
    const res = await fetch(`${sb.url}/rest/v1/${base}?select=key,enabled`, {
      headers: headers(sb.key),
      cache: 'no-store',
    });
    if (!res.ok) return {};
    const rows = (await res.json()) as { key: string; enabled: boolean }[];
    return Object.fromEntries(rows.map((r) => [r.key, r.enabled]));
  } catch {
    return {};
  }
}

/** Set (enabled=boolean) or clear (enabled=null) the override for a flag key. */
export async function setFlagOverride(
  key: string,
  enabled: boolean | null,
  userId: string,
): Promise<void> {
  const sb = serviceClient();
  if (!sb) throw new Error('flag override backend not configured');

  if (enabled === null) {
    const url = `${sb.url}/rest/v1/${base}?key=eq.${encodeURIComponent(key)}`;
    const res = await fetch(url, { method: 'DELETE', headers: headers(sb.key) });
    if (!res.ok) throw new Error(`clear flag override failed: ${res.status}`);
    return;
  }

  const row = { key, enabled, updated_by: userId, updated_at: new Date().toISOString() };
  const res = await fetch(`${sb.url}/rest/v1/${base}?on_conflict=key`, {
    method: 'POST',
    headers: headers(sb.key, { Prefer: 'resolution=merge-duplicates' }),
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`set flag override failed: ${res.status}`);
}
