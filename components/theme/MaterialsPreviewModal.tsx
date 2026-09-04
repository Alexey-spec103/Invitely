"use client";

import { useState } from "react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import { formatPreviewDate } from "@/lib/themes/previewMedia";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { HeroSection, HERO_VARIANTS, DEFAULT_HERO_VARIANT } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import styles from "./MaterialsPreviewModal.module.css";

interface MaterialsPreviewModalProps {
  theme: Theme;
  name1: string;
  name2?: string;
  eventDate: string | null;
  onClose: () => void;
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
}: MaterialsPreviewModalProps) {
  const [tab, setTab] = useState<"invitations" | "banquet">("invitations");
  const names = name2 ? `${name1} & ${name2}` : name1;
  const initials = `${name1.charAt(0)}${(name2 ?? "").charAt(0)}`.toUpperCase();
  const dateLabel = eventDate
    ? formatPreviewDate(new Date(`${eventDate}T00:00:00`))
    : "Your event date";
  const recommendedVariant = recommendedHeroVariantFor(theme.id, theme.category);
  const heroVariant: HeroVariant = HERO_VARIANTS.includes(recommendedVariant as HeroVariant)
    ? (recommendedVariant as HeroVariant)
    : DEFAULT_HERO_VARIANT;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Full material set</p>
            <h2 className={styles.title}>{theme.name}</h2>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            onClick={() => setTab("invitations")}
            className={tab === "invitations" ? styles.tabActive : styles.tab}
          >
            Invitations
          </button>
          <button
            type="button"
            onClick={() => setTab("banquet")}
            className={tab === "banquet" ? styles.tabActive : styles.tab}
          >
            Banquet
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
                <p className={styles.caption}>Website</p>
              </div>

              <div className={styles.paperWrap}>
                <div className={styles.paper}>
                  <span className={styles.paperEyebrow}>Together with their families</span>
                  <span className={styles.paperNames}>{names}</span>
                  <span className={styles.paperDivider} aria-hidden="true" />
                  <span className={styles.paperDate}>{dateLabel}</span>
                </div>
                <p className={styles.caption}>Paper invitation</p>
              </div>
            </div>
          ) : (
            <div className={`${styles.materialsRow} ${styles.banquetSurface}`}>
              <div className={styles.tableCardWrap}>
                <div className={styles.tableCard}>
                  <span className={styles.tableCardLabel}>Table</span>
                  <span className={styles.tableCardNumber}>1</span>
                </div>
                <p className={styles.caption}>Table number</p>
              </div>

              <div className={styles.placeCardWrap}>
                <div className={styles.placeCard}>
                  <span className={styles.placeCardInitials}>{initials}</span>
                  <span className={styles.placeCardName}>Guest Name</span>
                  <span className={styles.placeCardTable}>Table 1</span>
                </div>
                <p className={styles.caption}>Place card</p>
              </div>
            </div>
          )}
        </ThemeProvider>

        <p className={styles.footerNote}>
          One style, applied everywhere your guests see it — change it once here and it carries
          through the site, invitations, and banquet cards.
        </p>
      </div>
    </div>
  );
}
