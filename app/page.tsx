import type { Metadata } from "next";
import { HomePageContent } from "@/components/marketing/HomePageContent";
import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";
import { buildHreflangAlternates } from "@/lib/i18n/hreflang";

// Technical SEO fix (2026-10-19): this page had no own metadata export at
// all, inheriting the root layout's entirely -- fine for title/description/
// OG (those stay the same here), but with no way to declare that 7 other
// language versions of this exact page now exist at /de, /fr, etc. (see
// app/[locale]/page.tsx). Explicit canonical here too, not just languages --
// Next's metadata merging replaces the whole `alternates` object per
// segment rather than deep-merging its keys, so the root layout's own
// `alternates: { canonical: "/" }` wouldn't survive if this only set
// `languages`.
export const metadata: Metadata = {
  alternates: { canonical: "/", languages: buildHreflangAlternates() },
};

/** The actual page body lives in components/marketing/HomePageContent.tsx,
 * not here -- Next.js/Turbopack doesn't reliably expose a named export from
 * a route's own page.tsx for another module to import (confirmed live:
 * app/[locale]/page.tsx importing HomePageContent from "../page" resolved
 * to `undefined` at runtime, "Element type is invalid... got: undefined",
 * despite type-checking fine). This file just resolves the cookie/geo-IP
 * locale for the "/" route and renders the shared body with it -- see
 * HomePageContent's own comment for why app/[locale]/page.tsx renders the
 * exact same thing with a URL-fixed locale instead. */
export default async function Home() {
  const locale = await resolveGuestLocale();
  return <HomePageContent locale={locale} />;
}
