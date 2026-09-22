import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isSupportedLocale, localeForCountry, type Locale } from "./locales";

/**
 * Resolves the guest-facing locale for one request, in priority order:
 * 1. The guest's own explicit choice this session (LanguageSwitcher's cookie).
 * 2. Vercel's geo-IP country header (`x-vercel-ip-country`, injected free on
 *    every request to a deployed app -- no third-party geo service needed),
 *    mapped to a locale via locales.ts's COUNTRY_TO_LOCALE.
 * 3. "en".
 *
 * `events.supported_locales` exists in the schema for a *future* host-facing
 * setting ("only offer these languages for my event") but has no dashboard
 * UI yet, and -- confirmed live -- the column's own DB default is `{en}`,
 * not null/empty. Gating on it today would silently limit every event to
 * English-only forever, not "until the host configures it" (there's nothing
 * for a host to configure yet). So this deliberately ignores that column for
 * now and always offers the full SUPPORTED_LOCALES set; wire the column back
 * in once real dashboard controls exist to set it meaningfully.
 */
export async function resolveGuestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE)?.value;
  if (cookieValue && isSupportedLocale(cookieValue)) {
    return cookieValue;
  }

  const headerList = await headers();
  const country = headerList.get("x-vercel-ip-country");
  const geoLocale = localeForCountry(country);
  if (geoLocale) {
    return geoLocale;
  }

  return DEFAULT_LOCALE;
}
