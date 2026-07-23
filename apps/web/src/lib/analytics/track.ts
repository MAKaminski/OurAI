import posthog from 'posthog-js';
import { analyticsEnabled } from './config';

/** Safe client-side event capture (no-op when analytics is disabled). */
export function track(event: string, properties?: Record<string, unknown>): void {
  if (!analyticsEnabled) return;
  posthog.capture(event, properties);
}
