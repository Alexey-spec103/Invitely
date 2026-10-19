import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./locales";

/** SEO fix (2026-10-19): shared by app/page.tsx and app/[locale]/page.tsx's
 * own `generateMetadata` so both sides of the hreflang relationship (the
 * default-locale page and every localized one) always list the exact same
 * set of alternates -- a single source of truth rather than hand-writing
 * the same 8-entry map twice and risking them drifting apart. English has
 * no /en route of its own (see app/[locale]/page.tsx's own comment on why)
 * so it points back to "/", same as x-default. */
export function buildHreflangAlternates(): Record<string, string> {
  const map: Record<string, string> = { "x-default": "/" };
  for (const locale of SUPPORTED_LOCALES) {
    map[locale] = locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
  }
  return map;
}
