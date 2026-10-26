"use client";

import { useEffect, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import { SECTION_ICONS, type SectionType } from "@/components/sections/registry";
import styles from "./SiteHeader.module.css";

// dashboard-audit critique 2026-10-04 (P2): raw platform emoji (🏠💌🗓️📍✅
// etc.) sat directly against this page's hand-illustrated botanical art --
// emoji render differently per OS and carry their own cartoon style, reading
// like a to-do app next to custom artwork. Now uses the shared SECTION_ICONS
// map (components/sections/registry.tsx) -- real Lucide icons as of
// 2026-10-16, previously the reason this file kept its own local duplicate
// (SECTION_ICONS was still plain emoji text then). One shared map now keeps
// what a host toggles in the dashboard visually matching what guests see in
// the live nav.

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

  // Design-audit finding (weddingpost.ru's own menu closes on Escape/scroll,
  // confirmed live; ours didn't): the nav menu used to close only by
  // clicking a link inside it or the hamburger button again -- confirmed
  // live, it stayed pinned open over the page on Escape or on scroll,
  // covering content underneath. Escape and scroll are the two standard
  // ways a user expects an open overlay menu to dismiss.
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const handleScroll = () => setMenuOpen(false);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen]);

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
    // Clipboard API throws in several real cases (no permission, insecure
    // context, browser-specific restrictions) -- same fallback dashboard's
    // own GuestManager.handleCopy already uses, so a guest without
    // clipboard access still gets the link instead of a button that
    // silently does nothing.
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", window.location.href);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  return (
    <header className={styles.header}>
      {/* Accessibility audit (2026-10-22): no way past the header's own
          controls (menu/language/music/share/calendar) to reach the real
          page content except tabbing through every one of them -- no skip
          link existed anywhere on the guest site (WCAG 2.4.1). Visually
          hidden until focused; targets the <main id="main-content">
          landmark added the same session. */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[200] focus:rounded-md focus:bg-black focus:px-4 focus:py-2 focus:text-white">
        {dict.siteHeader.skipToContent}
      </a>
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.menuButton}
          aria-label={dict.siteHeader.menu}
          aria-expanded={menuOpen}
          // Accessibility audit (2026-10-22): aria-expanded was wired but
          // nothing told a screen reader WHICH element it controls -- added
          // alongside the matching id on the <nav> below.
          aria-controls="site-header-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={styles.menuIcon} aria-hidden="true">
            ☰
          </span>
        </button>

        {/* UX audit (2026-10-26): this used to render after .actions
            (language/music/share/calendar), so opening the menu and
            pressing Tab skipped past all four of those before ever
            reaching the just-opened menu's own links -- reachable, not a
            trap, but a confusing focus-order surprise right after the
            action that opened it. `.menu` is `position: absolute`
            (confirmed in SiteHeader.module.css), so moving it here only
            changes tab order, not where it visually renders. */}
        {menuOpen && (
          <nav id="site-header-menu" className={styles.menu}>
            {sections.map((section) => {
              const Icon = SECTION_ICONS[section.type as SectionType];
              return (
                <a
                  key={section.type}
                  href={`#section-${section.type}`}
                  className={styles.menuLink}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className={styles.menuLinkIcon} aria-hidden="true">
                    {Icon ? <Icon size={16} strokeWidth={2} /> : null}
                  </span>
                  {section.label}
                </a>
              );
            })}
          </nav>
        )}

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
              {/* UX audit (2026-10-26): this was a bare Unicode arrow
                  character (U+2934) -- the exact same "renders differently
                  per OS / inherits whatever font is active" problem this
                  file's own top comment already called out for emoji, just
                  missed for a plain symbol. Confirmed live: rendered as an
                  unrecognizable glyph against this page's cursive/script
                  fonts. A real Lucide icon, matching every other icon in
                  this header/the SECTION_ICONS map, renders identically
                  everywhere. */}
              <Share2 className={styles.shareIcon} aria-hidden="true" />
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

      {musicUrl && <audio ref={audioRef} src={musicUrl} loop />}
    </header>
  );
}
