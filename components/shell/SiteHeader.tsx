"use client";

import { useEffect, useRef, useState } from "react";
import {
  Home,
  Mail,
  CalendarDays,
  MapPin,
  CheckCircle2,
  Hourglass,
  Gift,
  Shirt,
  BookOpen,
  Video,
  UtensilsCrossed,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import type { SectionType } from "@/components/sections/registry";
import styles from "./SiteHeader.module.css";

// dashboard-audit critique 2026-10-04 (P2): raw platform emoji (🏠💌🗓️📍✅
// etc.) sat directly against this page's hand-illustrated botanical art --
// emoji render differently per OS and carry their own cartoon style, reading
// like a to-do app next to custom artwork. Same line-icon choices already
// used by the dashboard's own module list (app/dashboard/[eventId]/site/
// SectionModulesPanel.tsx's MODULE_ICON_COMPONENTS, added for the identical
// "emoji standing in for an icon system" reason) -- reusing them here keeps
// what a host toggles in the dashboard visually matching what guests see in
// the live nav, rather than inventing a third icon choice. Kept as a local
// map rather than widening the shared SECTION_ICONS emoji export, same
// reasoning as that file's own comment: ~20 other call sites still depend on
// SECTION_ICONS being plain emoji text, and this is a cosmetic change scoped
// to just this one nav.
const NAV_ICON_COMPONENTS: Partial<Record<SectionType, LucideIcon>> = {
  hero: Home,
  letter: Mail,
  timeline: CalendarDays,
  map: MapPin,
  rsvp: CheckCircle2,
  countdown: Hourglass,
  gift: Gift,
  dressCode: Shirt,
  guestbook: BookOpen,
  video: Video,
  banquetNavigator: UtensilsCrossed,
  guestNotes: StickyNote,
};

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
          {sections.map((section) => {
            const Icon = NAV_ICON_COMPONENTS[section.type as SectionType];
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

      {musicUrl && <audio ref={audioRef} src={musicUrl} loop />}
    </header>
  );
}
