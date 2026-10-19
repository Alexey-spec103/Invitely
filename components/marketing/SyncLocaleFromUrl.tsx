"use client";

import { useEffect } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/locales";

/** SEO fix (2026-10-19): app/[locale]/page.tsx is a static page -- there's
 * no per-request server context to write the guest-facing cookie from the
 * way resolveGuestLocale()'s own call sites normally would. Without this, a
 * visitor who lands on /fr from search and clicks through to /onboarding
 * (which resolves its own language from the same cookie, not the URL they
 * arrived from) would silently fall back to English/geo-IP instead of
 * continuing in French.
 *
 * Writes the cookie directly rather than calling the `setLocale` Server
 * Action (lib/i18n/actions.ts) -- per that cookie's own doc comment
 * (lib/i18n/locales.ts), it's "not httpOnly... a display preference, not a
 * secret," and the Server Action exists only to trigger Next's `refresh()`
 * for an immediate re-render of the *current* page. Not needed here: this
 * page is already server-rendered in the right language, so re-rendering
 * it again on mount would just be a wasted round-trip. Same attributes
 * (path, max-age, sameSite) as the Server Action uses, so behavior is
 * identical either way the cookie gets set.
 *
 * Also corrects <html lang>, which the root layout sets from
 * resolveGuestLocale() (cookie/geo-IP) with no way to know about this
 * page's own URL segment -- a first-time visitor with no cookie yet could
 * otherwise get lang="en" on French content. Known limitation: this runs
 * after hydration, not in the initial server-rendered HTML -- acceptable
 * since Google does not use `html lang` as a ranking signal (only
 * accessibility/browser-translate-prompt read it); the actual ranking
 * signal -- server-rendered content + hreflang -- has zero JS dependency. */
export default function SyncLocaleFromUrl({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);
  return null;
}
