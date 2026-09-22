"use client";

import { useEffect, useRef, useState } from "react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import styles from "./SiteHeader.module.css";

interface SiteHeaderProps {
  sections: { type: string; label: string }[];
  calendarHref: string;
  musicUrl?: string;
  eventTitle?: string;
  locale: Locale;
  availableLocales: readonly Locale[];
}

// `dict` is never passed as a prop -- its string-formatting entries are
// plain functions, and a Server Component can't send a function across the
// boundary to a "use client" component (confirmed live: React throws a
// serialization error at runtime, not a build-time type error, since
// `Dictionary`'s shape is still perfectly valid TypeScript). `locale` (a
// plain string) crosses fine; every client component that needs translated
// text resolves its own dictionary locally from that instead.
export default function SiteHeader({
  sections,
  calendarHref,
  musicUrl,
  eventTitle,
  locale,
  availableLocales,
}: SiteHeaderProps) {
  const dict = getDictionary(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shareWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!shareOpen) return;
    const handler = (event: MouseEvent) => {
      if (shareWrapRef.current && !shareWrapRef.current.contains(event.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shareOpen]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (playing) {
      audio.pause();
    } else {
      void audio.play();
    }
    setPlaying(!playing);
  };

  const shareText = dict.siteHeader.shareText(eventTitle);

  const handleShareClick = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareText, url: window.location.href });
      } catch {
        // User dismissed the native share sheet — no fallback needed.
      }
      return;
    }
    setShareOpen((open) => !open);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.menuButton}
          aria-label={dict.siteHeader.menu}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={styles.menuIcon} aria-hidden="true">
            ☰
          </span>
        </button>

        <div className={styles.actions}>
          <LanguageSwitcher
            currentLocale={locale}
            availableLocales={availableLocales}
            label={dict.languageSwitcher.label}
          />
          {musicUrl && (
            <button
              type="button"
              className={styles.iconButton}
              onClick={toggleMusic}
              aria-label={playing ? dict.siteHeader.pauseMusic : dict.siteHeader.playMusic}
            >
              {playing ? "⏸" : "▶"}
            </button>
          )}
          <div className={styles.shareWrap} ref={shareWrapRef}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={handleShareClick}
              aria-label={dict.siteHeader.share}
              aria-expanded={shareOpen}
            >
              ⤴
            </button>
            {shareOpen && (
              <div className={styles.sharePanel}>
                <button type="button" className={styles.shareItem} onClick={copyLink}>
                  {copied ? dict.siteHeader.linkCopied : dict.siteHeader.copyLink}
                </button>
                <a
                  className={styles.shareItem}
                  href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
                <a
                  className={styles.shareItem}
                  href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram
                </a>
                <a
                  className={styles.shareItem}
                  href={`mailto:?subject=${encodedText}&body=${encodedUrl}`}
                >
                  Email
                </a>
              </div>
            )}
          </div>
          <a href={calendarHref} download className={styles.calendarButton}>
            {dict.siteHeader.addToCalendar}
          </a>
        </div>
      </div>

      {menuOpen && (
        <nav className={styles.menu}>
          {sections.map((section) => (
            <a
              key={section.type}
              href={`#section-${section.type}`}
              className={styles.menuLink}
              onClick={() => setMenuOpen(false)}
            >
              {section.label}
            </a>
          ))}
        </nav>
      )}

      {musicUrl && <audio ref={audioRef} src={musicUrl} loop />}
    </header>
  );
}
