import { DEFAULT_LOCALE, LOCALE_TO_BCP47, type Locale } from "@/lib/i18n/locales";

/** `locale` defaults to English, not made required -- several callers (paper
 * previews rendered without a guest/host locale in scope, PDF generation
 * that hasn't threaded one through yet) still only have a raw ISO date and
 * no locale, same reasoning as HeroSectionProps.locale's own default. Same
 * `LOCALE_TO_BCP47` lookup LetterSection's own `formatDeadline` already uses
 * for its RSVP-deadline date, reused here rather than re-invented. */
export function formatEventDate(isoDate: string, locale: Locale = DEFAULT_LOCALE) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(LOCALE_TO_BCP47[locale], { year: "numeric", month: "long", day: "numeric" });
}
