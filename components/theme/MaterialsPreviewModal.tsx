"use client";

import { useEffect, useRef, useState } from "react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import { formatPreviewDate } from "@/lib/themes/previewMedia";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { HeroSection, HERO_VARIANTS, DEFAULT_HERO_VARIANT } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import styles from "./MaterialsPreviewModal.module.css";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface MaterialsPreviewModalProps {
  theme: Theme;
  name1: string;
  name2?: string;
  eventDate: string | null;
  onClose: () => void;
  /** Optional, defaulting to English -- same convention as ModuleCard/
   * FirstVisitTour, so any not-yet-localized call site keeps working. */
  locale?: Locale;
}

/** Shows the same theme applied across the whole real-world material set at
 * once -- digital site (phone), paper invitation, and banquet cards (table
 * number + place card) -- toggled via "Invitations"/"Banquet", so a host
 * sees the full package rather than just the website. All live CSS
 * mockups (same screenshot-free approach as `ThemeGallery`'s cards), not
 * the real react-pdf documents -- those render in a completely different
 * engine and aren't embeddable in a live browser modal. */
export default function MaterialsPreviewModal({
  theme,
  name1,
  name2,
  eventDate,
  onClose,
  locale,
}: MaterialsPreviewModalProps) {
  const t = getDictionary(locale ?? "en").dashboard.style.materialsPreview;
  const [tab, setTab] = useState<"invitations" | "banquet">("invitations");
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Accessibility audit: this modal had no dialog role/aria-modal/
  // aria-labelledby, no Escape-to-close, and no focus management at all --
  // the only exits were a mouse click on the overlay or tabbing to the "x"
  // button. Mirrors the same trap pattern as AddElementModal/PlanSelectForm's
  // anonymous-upgrade modal.
  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const names = name2 ? `${name1} & ${name2}` : name1;
  const initials = `${name1.charAt(0)}${(name2 ?? "").charAt(0)}`.toUpperCase();
  const dateLabel = eventDate
    ? formatPreviewDate(new Date(`${eventDate}T00:00:00`))
    : t.yourEventDate;
  const recommendedVariant = recommendedHeroVariantFor(theme.id, theme.category);
  const heroVariant: HeroVariant = HERO_VARIANTS.includes(recommendedVariant as HeroVariant)
    ? (recommendedVariant as HeroVariant)
    : DEFAULT_HERO_VARIANT;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="materials-preview-modal-title"
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{t.eyebrow}</p>
            <h2 id="materials-preview-modal-title" className={styles.title}>{theme.name}</h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className={styles.closeBtn} aria-label={t.close}>
            ×
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            onClick={() => setTab("invitations")}
            className={tab === "invitations" ? styles.tabActive : styles.tab}
          >
            {t.invitations}
          </button>
          <button
            type="button"
            onClick={() => setTab("banquet")}
            className={tab === "banquet" ? styles.tabActive : styles.tab}
          >
            {t.banquet}
          </button>
        </div>

        <ThemeProvider theme={theme}>
          {tab === "invitations" ? (
            <div className={styles.materialsRow}>
              <div className={styles.phone}>
                <span className={styles.phoneNotch} aria-hidden="true" />
                <div className={styles.phoneScreen}>
                  <div className={styles.phoneScaleInner}>
                    <HeroSection
                      variant={heroVariant}
                      names={name2 ? [name1, name2] : [name1]}
                      eventDate={dateLabel}
                    />
                  </div>
                </div>
                <p className={styles.caption}>{t.website}</p>
              </div>

              <div className={styles.paperWrap}>
                <div className={styles.paper}>
                  <span className={styles.paperEyebrow}>{t.togetherWithFamilies}</span>
                  <span className={styles.paperNames}>{names}</span>
                  <span className={styles.paperDivider} aria-hidden="true" />
                  <span className={styles.paperDate}>{dateLabel}</span>
                </div>
                <p className={styles.caption}>{t.paperInvitation}</p>
              </div>
            </div>
          ) : (
            <div className={`${styles.materialsRow} ${styles.banquetSurface}`}>
              <div className={styles.tableCardWrap}>
                <div className={styles.tableCard}>
                  <span className={styles.tableCardLabel}>{t.tableLabel}</span>
                  <span className={styles.tableCardNumber}>1</span>
                </div>
                <p className={styles.caption}>{t.tableNumberCaption}</p>
              </div>

              <div className={styles.placeCardWrap}>
                <div className={styles.placeCard}>
                  <span className={styles.placeCardInitials}>{initials}</span>
                  <span className={styles.placeCardName}>{t.guestName}</span>
                  <span className={styles.placeCardTable}>{t.tableWithNumber(1)}</span>
                </div>
                <p className={styles.caption}>{t.placeCard}</p>
              </div>
            </div>
          )}
        </ThemeProvider>

        <p className={styles.footerNote}>{t.footerNote}</p>
      </div>
    </div>
  );
}
