export const SUPPORTED_LOCALES = ["en", "de", "fr", "es", "it", "pl", "ru", "uk"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** SEO fix (2026-10-19): the locales that get their own URL segment
 * (/de, /fr, etc. -- see app/[locale]/page.tsx) -- every supported locale
 * except the default, which stays at bare "/" (an /en route would be
 * near-duplicate content of it). Derived from SUPPORTED_LOCALES rather
 * than hardcoded a second time, so it can never drift out of sync with it;
 * shared by app/[locale]/page.tsx (generateStaticParams) and
 * app/sitemap.ts (which URLs to list). */
export const NON_DEFAULT_LOCALES = SUPPORTED_LOCALES.filter(
  (locale): locale is Exclude<Locale, typeof DEFAULT_LOCALE> => locale !== DEFAULT_LOCALE
);

/** Set server-side by the `setLocale` Server Action (lib/i18n/actions.ts,
 * called from LanguageSwitcher.tsx) and read server-side by resolveLocale.ts.
 * Lives here, not in resolveLocale.ts, specifically so LanguageSwitcher (a
 * "use client" component) can import this one constant without pulling in
 * resolveLocale.ts's `next/headers` import -- that's a server-only API, and
 * a client component importing anything that touches it breaks the build
 * (confirmed live: "You're importing a module that depends on next/headers
 * ... in the Pages Router" even though this is the App Router -- Turbopack's
 * actual complaint is the client/server module boundary, not the router).
 * Not httpOnly: this is a display preference, not a secret -- the Server
 * Action route is purely so Next 16's `refresh()` (next/cache) actually
 * re-renders the page, not for any security reason. */
export const LOCALE_COOKIE = "invitely_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  pl: "Polski",
  ru: "Русский",
  uk: "Українська",
};

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** email-audit (2026-10-10): the locale for every transactional email --
 * guest-facing and host-facing alike -- is the sending event's own
 * `events.default_locale`, the language the host set the event up in.
 * Unlike resolveGuestLocale() (cookie/geo-IP, meaningful only for a live
 * page request from a specific visitor), an email send has no "current
 * visitor" to read a cookie from, and there's no per-guest or per-account
 * locale stored anywhere in the schema -- `default_locale` is the only real
 * signal available at send time. Validates against the real supported set
 * rather than trusting the column blindly (a column read from a possibly-
 * stale `EVENT_COLUMNS` select, or a row from before this column existed,
 * could hold anything) -- falls back to English rather than ever throwing,
 * since a wrong/missing locale must never be the reason an email fails to
 * send. */
export function resolveEmailLocale(defaultLocale: string | null | undefined): Locale {
  if (defaultLocale && isSupportedLocale(defaultLocale)) {
    return defaultLocale;
  }
  return DEFAULT_LOCALE;
}

/** BCP-47 tag for `Intl`/`toLocaleDateString` calls, keyed by our own
 * `Locale` type -- LetterSection's RSVP-deadline date (e.g. "December 31,
 * 2026") was hardcoded to "en-US" regardless of the guest's actual language
 * before this existed; use this instead of a bare Locale string anywhere a
 * date/number needs real locale-aware formatting. */
export const LOCALE_TO_BCP47: Record<Locale, string> = {
  en: "en-US",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pl: "pl-PL",
  ru: "ru-RU",
  uk: "uk-UA",
};

/** Vercel injects `x-vercel-ip-country` (ISO 3166-1 alpha-2) on every
 * request to a deployed app, free, no third-party geo-IP service needed --
 * see resolveLocale.ts. Only used to pick a sensible *default* the first
 * time a guest arrives; the language switcher always lets them override it,
 * matching "guest sees only the language they actually want," not one
 * forced by their location. */
const COUNTRY_TO_LOCALE: Partial<Record<string, Locale>> = {
  DE: "de",
  AT: "de",
  CH: "de",
  LI: "de",
  FR: "fr",
  BE: "fr",
  LU: "fr",
  MC: "fr",
  ES: "es",
  IT: "it",
  SM: "it",
  VA: "it",
  PL: "pl",
  RU: "ru",
  BY: "ru",
  KZ: "ru",
  UA: "uk",
};

export function localeForCountry(countryCode: string | null | undefined): Locale | null {
  if (!countryCode) return null;
  return COUNTRY_TO_LOCALE[countryCode.toUpperCase()] ?? null;
}
