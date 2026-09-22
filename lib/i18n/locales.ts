export const SUPPORTED_LOCALES = ["en", "de", "fr", "es", "it", "pl", "ru", "uk"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Set client-side by LanguageSwitcher.tsx (a plain `document.cookie` write
 * followed by `router.refresh()`) and read server-side by resolveLocale.ts.
 * Lives here, not in resolveLocale.ts, specifically so LanguageSwitcher (a
 * "use client" component) can import this one constant without pulling in
 * resolveLocale.ts's `next/headers` import -- that's a server-only API, and
 * a client component importing anything that touches it breaks the build
 * (confirmed live: "You're importing a module that depends on next/headers
 * ... in the Pages Router" even though this is the App Router -- Turbopack's
 * actual complaint is the client/server module boundary, not the router).
 * Not httpOnly: this is a display preference, not a secret, and needs to be
 * settable from a client component without a round trip through a Server
 * Action. */
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
