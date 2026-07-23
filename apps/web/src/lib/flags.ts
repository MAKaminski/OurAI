/** Client-safe feature flags read from public env. */

function boolFlag(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') return defaultValue;
  return value !== 'false' && value !== '0';
}

/**
 * Social-proof waitlist counter. Gated two ways:
 *  - `enabled`: a feature flag (NEXT_PUBLIC_WAITLIST_COUNT_ENABLED) — a kill
 *    switch, on by default so it reveals automatically once the threshold hits.
 *  - `minReveal`: never reveal until at least this many pre-signups exist
 *    (NEXT_PUBLIC_WAITLIST_MIN_REVEAL, default 20) — so early visitors don't see
 *    a tiny, discouraging number.
 */
export function waitlistCountFlag(): { enabled: boolean; minReveal: number } {
  const enabled = boolFlag(process.env.NEXT_PUBLIC_WAITLIST_COUNT_ENABLED, true);
  const minReveal = Number.parseInt(process.env.NEXT_PUBLIC_WAITLIST_MIN_REVEAL ?? '', 10) || 20;
  return { enabled, minReveal };
}
