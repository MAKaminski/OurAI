'use client';

import { useFeatureFlagEnabled } from 'posthog-js/react';
import { analyticsEnabled } from '@/lib/analytics/config';
import { FLAGS, type FlagName } from './registry';

/**
 * Client feature-flag hook. Returns PostHog's value once loaded, otherwise the
 * registry default. When PostHog isn't configured it always returns the default,
 * so components behave identically in no-key / CI builds. Never treats the
 * not-yet-loaded `undefined` as `false`.
 */
export function useFlag(name: FlagName): boolean {
  const def = FLAGS[name];
  const phValue = useFeatureFlagEnabled(def.key);
  if (!analyticsEnabled) return def.defaultValue;
  return phValue ?? def.defaultValue;
}
