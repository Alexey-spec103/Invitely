import * as Sentry from "@sentry/nextjs";

// Covers the proxy/middleware runtime (lib/supabase/proxy.ts's
// updateSession etc.) -- Edge is a separate runtime from Node, so it needs
// its own init call, same no-op-when-empty behavior as the other two.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});
