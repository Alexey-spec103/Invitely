"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { LOCALE_LABELS, type Locale } from "@/lib/i18n/locales";
import { setLocale } from "@/lib/i18n/actions";
import styles from "./LanguageSwitcher.module.css";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  availableLocales: readonly Locale[];
  /** "Language" in the resolved dictionary -- shown as the button's
   * aria-label, since the button itself only shows the current locale code
   * (e.g. "EN"), not a text label. */
  label: string;
  /** When provided, selecting a locale calls this instead of writing the
   * guest-facing cookie + router.refresh() -- used by the constructor's own
   * "preview as" picker, which flips a local React state for the live
   * preview rather than the actual guest's stored language choice. */
  onSelect?: (locale: Locale) => void;
}

/** A compact top-bar dropdown -- current locale as a small pill (e.g. "EN"),
 * click to reveal the full list -- rather than buried inside a hamburger
 * menu, matching how language pickers work on most real sites (visible at a
 * glance, one click away) instead of requiring a guest to already suspect
 * one exists. Reused as-is on both the guest-facing public site (SiteHeader)
 * and the marketing landing page header, so the same control/behavior shows
 * up everywhere a locale choice is offered.
 *
 * Sets the guest's explicit choice via the `setLocale` Server Action
 * (lib/i18n/actions.ts), which writes the cookie server-side then calls
 * Next 16's `refresh()` (next/cache) -- see that file's comment for why a
 * plain client-side `document.cookie` + `router.refresh()` (the previous
 * approach) silently failed to update the page. */
export default function LanguageSwitcher({ currentLocale, availableLocales, label, onSelect }: LanguageSwitcherProps) {
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
    if (onSelect) {
      onSelect(locale);
      setOpen(false);
      return;
    }
    setOpen(false);
    // Next 16's own guide (node_modules/next/dist/docs/.../interactive-apps.md)
    // wraps every Server Function that calls refresh() in startTransition --
    // a bare fire-and-forget call worked most of the time in manual testing
    // but not reliably (confirmed live: an identical click sometimes left the
    // pill showing the old locale even though the cookie had updated
    // correctly), since nothing told React the pending RSC update belonged
    // to this interaction's render lifecycle.
    startTransition(() => {
      void setLocale(locale);
    });
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
