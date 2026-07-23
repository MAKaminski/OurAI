/** Client-safe env flag: the social-proof waitlist counter. */
function boolFlag(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') return defaultValue;
  return value !== 'false' && value !== '0';
}

export function waitlistCountFlag(): { enabled: boolean; minReveal: number } {
  const enabled = boolFlag(process.env.NEXT_PUBLIC_WAITLIST_COUNT_ENABLED, true);
  const minReveal = Number.parseInt(process.env.NEXT_PUBLIC_WAITLIST_MIN_REVEAL ?? '', 10) || 20;
  return { enabled, minReveal };
}

// Pure registry re-exports are safe in any context. Import the client hook from
// './useFlag' and the server helper from './server' directly where needed.
export { FLAGS, flagKey, flagDefault, type FlagName, type FlagDefinition } from './registry';
