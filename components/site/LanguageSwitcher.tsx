"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, LOCALE_LABELS, type Locale } from "@/lib/i18n/locales";
import styles from "./LanguageSwitcher.module.css";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  availableLocales: readonly Locale[];
  label: string;
}

/** Sets the guest's explicit locale choice directly via `document.cookie`
 * (a plain, non-httpOnly cookie -- this is a display preference, not a
 * secret) then `router.refresh()`, which re-runs the server-rendered page
 * with `resolveGuestLocale` now reading that cookie first -- see
 * lib/i18n/resolveLocale.ts's priority order. No Server Action needed for
 * something this simple. */
export default function LanguageSwitcher({ currentLocale, availableLocales, label }: LanguageSwitcherProps) {
  const router = useRouter();

  if (availableLocales.length <= 1) {
    return null;
  }

  const selectLocale = (locale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{label}</span>
      <div className={styles.list}>
        {availableLocales.map((locale) => (
          <button
            key={locale}
            type="button"
            className={locale === currentLocale ? styles.optionActive : styles.option}
            onClick={() => selectLocale(locale)}
          >
            {LOCALE_LABELS[locale]}
          </button>
        ))}
      </div>
    </div>
  );
}
