import { analyticsEnabled, posthogConfig } from '@/lib/analytics/config';
import { FLAGS, type FlagName } from './registry';

/**
 * Server-side flag evaluation for gating routes / pages / API handlers.
 * Degrades to the registry default when PostHog is unconfigured, has no distinct
 * id, or the request fails — a gate must never throw or block the request path.
 *
 * `distinctId` should be the Supabase user id (getCurrentUser().id). Dependency-
 * free (mirrors captureServerEvent); swap for posthog-node local eval later
 * without changing this signature.
 */
export async function isFlagEnabled(
  name: FlagName,
  distinctId: string | null | undefined,
): Promise<boolean> {
  const def = FLAGS[name];
  if (!analyticsEnabled || !distinctId) return def.defaultValue;
  try {
    const res = await fetch(`${posthogConfig.host}/flags?v=2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: posthogConfig.key, distinct_id: distinctId }),
      cache: 'no-store',
    });
    if (!res.ok) return def.defaultValue;
    const data = (await res.json()) as { featureFlags?: Record<string, boolean | string> };
    const value = data.featureFlags?.[def.key];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return true; // an experiment variant = enabled
    return def.defaultValue;
  } catch {
    return def.defaultValue;
  }
}
