import { posthogConfig } from './config';

/**
 * Server-side event capture via PostHog's public capture endpoint. Used for the
 * waitlist signup so the conversion is recorded even if the client is blocked.
 * No SDK dependency — a single fetch to the capture API.
 */
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties: Record<string, unknown> = {},
): Promise<void> {
  if (!posthogConfig.key) return;
  try {
    await fetch(`${posthogConfig.host}/i/v0/e/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: posthogConfig.key,
        event,
        distinct_id: distinctId,
        properties: { ...properties, $lib: 'ourai-server' },
      }),
    });
  } catch {
    // Analytics must never break the request path.
  }
}
