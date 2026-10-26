const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Performance audit (2026-10-26): the old top-level `import * as Sentry from
// "@sentry/nextjs"` shipped the full client SDK (tracing + error capture,
// ~600KB of source across two chunks, confirmed live via the Resource Timing
// API) to every single visitor, on every page -- even with DSN empty, where
// `Sentry.init()` was already a documented no-op at runtime. A static import
// can't be skipped at runtime; only gating the import itself behind this
// build-time-inlined env var lets the bundler dead-code-eliminate the whole
// branch when DSN is unset, instead of merely skipping what the code does.
// Set NEXT_PUBLIC_SENTRY_DSN for real and this goes back to loading eagerly
// (worth it once there's an actual DSN to get error visibility from).
if (dsn) {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      // Session Replay is opt-in and off by default here -- it captures DOM
      // snapshots, which for this product would include guest names, RSVP
      // answers, and photos a host uploaded. Revisit only with explicit PII
      // masking configured, not as a default-on capability.
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
  });
}

// Next's router calls `hooks.onRouterTransitionStart?.(...)` -- optional-
// chained, so simply not exporting this when Sentry isn't loaded is the
// correct no-op (see node_modules/next/dist/client/components/router-
// transition.js), not a half-broken stub.
export const onRouterTransitionStart = dsn
  ? (href: string, navigationType: string) => {
      import("@sentry/nextjs").then(({ captureRouterTransitionStart }) =>
        captureRouterTransitionStart(href, navigationType)
      );
    }
  : undefined;
