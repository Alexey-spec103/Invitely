"use client";

import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

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
      onSelect={(locale) => router.push(locale === DEFAULT_LOCALE ? "/" : `/${locale}`)}
    />
  );
}
