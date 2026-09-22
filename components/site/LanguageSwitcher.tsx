"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, LOCALE_LABELS, type Locale } from "@/lib/i18n/locales";
import styles from "./LanguageSwitcher.module.css";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  availableLocales: readonly Locale[];
  /** "Language" in the resolved dictionary -- shown as the button's
   * aria-label, since the button itself only shows the current locale code
   * (e.g. "EN"), not a text label. */
  label: string;
}

/** A compact top-bar dropdown -- current locale as a small pill (e.g. "EN"),
 * click to reveal the full list -- rather than buried inside a hamburger
 * menu, matching how language pickers work on most real sites (visible at a
 * glance, one click away) instead of requiring a guest to already suspect
 * one exists. Reused as-is on both the guest-facing public site (SiteHeader)
 * and the marketing landing page header, so the same control/behavior shows
 * up everywhere a locale choice is offered.
 *
 * Sets the guest's explicit choice directly via `document.cookie` (a plain,
 * non-httpOnly cookie -- this is a display preference, not a secret) then
 * `router.refresh()`, which re-runs the server-rendered page with
 * `resolveGuestLocale` now reading that cookie first -- see
 * lib/i18n/resolveLocale.ts's priority order. No Server Action needed for
 * something this simple. */
export default function LanguageSwitcher({ currentLocale, availableLocales, label }: LanguageSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (availableLocales.length <= 1) {
    return null;
  }

  const selectLocale = (locale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    setOpen(false);
    router.refresh();
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        aria-label={label}
        aria-expanded={open}
      >
        {currentLocale.toUpperCase()}
      </button>
      {open && (
        <div className={styles.panel}>
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
      )}
    </div>
  );
}
