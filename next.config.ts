import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
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
