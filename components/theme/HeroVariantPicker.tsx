"use client";

import { HeroSection } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import styles from "./HeroVariantPicker.module.css";

export const HERO_VARIANT_LABELS: Record<HeroVariant, string> = {
  "monogram-center": "Monogram Center",
  "photo-full-bleed": "Photo Full Bleed",
  "minimal-text": "Minimal Text",
  "editorial-split": "Editorial Split",
  signature: "Signature",
  "editorial-minimal": "Editorial Minimalism",
  "botanical-frame": "Botanical Line-Art",
  "hand-lettering": "Hand Lettering",
  letterpress: "Archival Letterpress",
  "art-deco-crest": "Art Deco",
  "watercolor-bloom": "Watercolor",
  "coastal-wave": "Coastal",
  "vintage-ornamental": "Vintage Regency",
  "boho-asymmetric": "Boho",
  "monogram-crest": "Monogram Crest",
  "folk-ornament": "Folk Ornament",
  "collage-scrapbook": "Collage / Scrapbook",
};

interface HeroVariantPickerProps {
  theme: Theme;
  names: string[];
  eventDate: string;
  photoUrl?: string;
  value: HeroVariant;
  onChange: (variant: HeroVariant) => void;
  variants: readonly HeroVariant[];
}

/** Replaces a text `<select>` of layout names with a grid of small, truly
 * live-rendered Hero previews (real ThemeProvider + HeroSection, scaled
 * down via CSS transform -- same center-anchored-crop technique already
 * proven in the onboarding wizard's preview panel) so a host can see what
 * each layout actually looks like before picking it. */
export default function HeroVariantPicker({
  theme,
  names,
  eventDate,
  photoUrl,
  value,
  onChange,
  variants,
}: HeroVariantPickerProps) {
  return (
    <div className={styles.grid}>
      {variants.map((variant) => (
        <button
          key={variant}
          type="button"
          onClick={() => onChange(variant)}
          className={variant === value ? styles.cardSelected : styles.card}
        >
          <div className={styles.thumb}>
            <div className={styles.scaleWrap}>
              <ThemeProvider theme={theme}>
                <HeroSection variant={variant} names={names} eventDate={eventDate} photoUrl={photoUrl} />
              </ThemeProvider>
            </div>
          </div>
          <span className={styles.label}>{HERO_VARIANT_LABELS[variant]}</span>
        </button>
      ))}
    </div>
  );
}
