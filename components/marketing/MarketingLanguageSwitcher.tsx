"use client";

import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locales";

/** SEO fix (2026-10-19): the plain LanguageSwitcher's default behavior
 * (onSelect unset) writes the guest-facing cookie and re-renders the SAME
 * URL -- correct for a cookie-only locale (onboarding, the guest site), but
 * wrong now that the marketing homepage has real per-locale URLs (/de,
 * /fr, etc., see app/[locale]/page.tsx). Picking a language here needs to
 * navigate, not just silently change content under an unchanged URL --
 * LanguageSwitcher's `onSelect` prop replaces its default handling
 * entirely (components/site/LanguageSwitcher.tsx's own `selectLocale`),
 * which is exactly the hook this needs. The destination page's own
 * SyncLocaleFromUrl writes the cookie on arrival, so this only needs to
 * navigate -- see its own comment for why that's not duplicated here. */
export default function MarketingLanguageSwitcher(props: {
  currentLocale: Locale;
  availableLocales: readonly Locale[];
  label: string;
}) {
  const router = useRouter();
  return (
    <LanguageSwitcher
      {...props}
      onSelect={(locale) => {
        // Bug fix (2026-10-28), reported live: picking every OTHER locale
        // worked (its own /[locale] page's SyncLocaleFromUrl writes the
        // cookie on arrival -- see that component's comment), but picking
        // English silently did nothing visible -- bare "/" has no such
        // sync, since app/page.tsx resolves its language from the cookie
        // itself (there's no "/en" URL segment to sync FROM). A visitor
        // whose cookie already said e.g. "de" landed back on "/" and
        // resolveGuestLocale() just read "de" straight off the stale
        // cookie again, rendering German on the English URL. Writing the
        // cookie here first (same attributes SyncLocaleFromUrl already
        // uses) closes that one gap without touching the other locales'
        // already-correct path.
        if (locale === DEFAULT_LOCALE) {
          document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
        }
        router.push(locale === DEFAULT_LOCALE ? "/" : `/${locale}`);
      }}
    />
  );
}
