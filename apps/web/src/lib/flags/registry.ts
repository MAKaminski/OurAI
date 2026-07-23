/**
 * Single source of truth for every feature flag in OurAI.
 * - `key` is the exact PostHog flag key (kebab-case, matches the PostHog UI).
 * - `defaultValue` is used when PostHog is unconfigured, still loading, or the
 *   flag is missing — so CI/build and no-key deploys behave deterministically.
 * - NEW features ship with `defaultValue: false` ("dark launch") and get flipped
 *   on in PostHog; already-shipped features default `true` (kill switch + measure).
 *
 * Every feature references `FLAGS.x`, never a raw string.
 */
export interface FlagDefinition {
  key: string;
  defaultValue: boolean;
  description: string;
  /** True when this key backs a PostHog experiment (multivariate). */
  experiment?: boolean;
}

export const FLAGS = {
  chat: {
    key: 'chat',
    defaultValue: true,
    description: 'In-app chat, workspaces, and the Support workspace/messaging.',
  },
  contextManager: {
    key: 'context-manager',
    defaultValue: false,
    description: 'Context library: create, organize, and sort org/personal context.',
  },
  waitlistCount: {
    key: 'waitlist-count',
    defaultValue: true,
    description: 'Social-proof pre-signup counter on the landing page.',
  },
} as const satisfies Record<string, FlagDefinition>;

export type FlagName = keyof typeof FLAGS;

export const flagKey = (name: FlagName): string => FLAGS[name].key;
export const flagDefault = (name: FlagName): boolean => FLAGS[name].defaultValue;
