import * as Sentry from "@sentry/nextjs";

// Same no-op-when-empty behavior as instrumentation-client.ts.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});
