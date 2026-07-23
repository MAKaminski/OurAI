'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { analyticsEnabled, posthogConfig } from './config';

/**
 * Initializes PostHog on the client. Captures pageviews manually (the App
 * Router does not fire full navigations), autocapture for clicks/inputs, and
 * PostHog's built-in referrer/UTM/entry-URL properties tell us where visitors
 * come from. Session recording is on so we can see where people drop off.
 */
function PageviewTracker() {
  const posthogClient = usePostHog();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthogClient || !pathname) return;
    let url = window.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    posthogClient.capture('$pageview', { $current_url: url });
  }, [posthogClient, pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  useEffect(() => {
    if (!analyticsEnabled || initialized.current) return;
    initialized.current = true;
    posthog.init(posthogConfig.key, {
      api_host: posthogConfig.host,
      capture_pageview: false, // handled manually below for the App Router
      capture_pageleave: true, // drop-off / exit tracking
      person_profiles: 'identified_only',
      autocapture: true,
      session_recording: { maskAllInputs: false },
    });
  }, []);

  if (!analyticsEnabled) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}
