/** Central analytics config. Analytics is a no-op unless a key is configured. */
export const posthogConfig = {
  key: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
};

export const analyticsEnabled = posthogConfig.key.length > 0;

/** Canonical event names — keep funnel steps consistent across the app. */
export const EVENTS = {
  WAITLIST_VIEW_FORM: 'waitlist_form_viewed',
  WAITLIST_SUBMIT: 'waitlist_submitted',
  DEMO_STARTED: 'demo_started',
  DEMO_SCENE_VIEWED: 'demo_scene_viewed',
  DEMO_COMPLETED: 'demo_completed',
  CTA_CLICKED: 'cta_clicked',
} as const;
