import type { MetadataRoute } from "next";

// Same hardcoded production origin as app/robots.ts -- no env var for this
// exists anywhere in the codebase yet.
const SITE_URL = "https://www.invimbo.com";

// Only the genuinely public, static marketing/legal pages -- app/(auth),
// app/dashboard, app/onboarding, app/preview, and app/dev are all
// auth-gated or internal, and app/e/[slug] is per-event user-generated
// content with its own metadata, not a fixed set of routes a sitemap can
// enumerate.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
