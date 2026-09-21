import * as Sentry from "@sentry/nextjs";

// Empty DSN (not yet set in .env.local -- see the comment there) makes
// Sentry.init() a documented no-op: it doesn't throw, just skips wiring up
// any reporting. Safe to leave this file active before a real DSN exists.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Session Replay is opt-in and off by default here -- it captures DOM
  // snapshots, which for this product would include guest names, RSVP
  // answers, and photos a host uploaded. Revisit only with explicit PII
  // masking configured, not as a default-on capability.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
