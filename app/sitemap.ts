import type { MetadataRoute } from "next";
import { NON_DEFAULT_LOCALES } from "@/lib/i18n/locales";

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
    // SEO fix (2026-10-19): the homepage's 7 other language versions
    // (app/[locale]/page.tsx) -- same priority as "/" itself, since each is
    // a full, real version of the homepage for its own language, not a
    // secondary page.
    ...NON_DEFAULT_LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}`,
      changeFrequency: "weekly" as const,
      priority: 1,
    })),
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
