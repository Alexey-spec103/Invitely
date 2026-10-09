import type { MetadataRoute } from "next";

// No env var for the production origin exists anywhere in this codebase yet
// (checked lib/email.ts, app/page.tsx, domain-actions.ts -- only the mail
// sender domain is defined) -- hardcoded to match this project's known
// production domain, same as every other hardcoded invimbo.com reference.
const SITE_URL = "https://www.invimbo.com";

// Dashboard/auth/onboarding/preview/dev routes are never meant to be
// indexed -- they're either auth-gated (useless to a crawler with no
// session) or internal tooling. Guest event pages (/e/*) are user-generated
// content with their own per-event metadata (built separately) -- a
// site-wide sitemap/robots entry for them doesn't make sense, and crawling
// them isn't actively harmful, so they're left unlisted rather than
// explicitly disallowed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/onboarding", "/preview", "/dev", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
