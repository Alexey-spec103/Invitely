import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  // security-baseline audit finding: no response security headers were set
  // anywhere in the app. Content-Security-Policy deliberately NOT included
  // here -- this app has several real external integrations (Stripe
  // Checkout, Supabase, Sentry, Vercel Analytics) and a wrong CSP breaks the
  // app rather than just failing to help; it needs its own dedicated pass
  // with live verification against every one of those, not a guessed
  // allowlist shipped alongside the other, safe-by-default headers below.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // SAMEORIGIN, not DENY -- nothing in this app frames its own
          // pages either way, but DENY is the wrong default to reach for
          // without checking: SAMEORIGIN is the safer-by-default choice
          // when nothing in the codebase actually relies on being framed
          // cross-origin.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

// withSentryConfig only wires up source-map upload (for readable stack
// traces on sentry.io) when SENTRY_AUTH_TOKEN/SENTRY_ORG/SENTRY_PROJECT are
// set -- without them it's documented to skip that step rather than fail
// the build, so this is safe to leave wrapped even before those exist.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
});
