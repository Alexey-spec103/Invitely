export { default as HeroSection } from "./HeroSection";
export type { HeroSectionProps, HeroSectionVariantProps, HeroVariant } from "./types";

import type { HeroVariant } from "./types";

export const HERO_VARIANTS: HeroVariant[] = [
  "monogram-center",
  "photo-full-bleed",
  "minimal-text",
  "editorial-split",
  "signature",
  "editorial-minimal",
  "botanical-frame",
  "hand-lettering",
  "letterpress",
  "art-deco-crest",
  "watercolor-bloom",
  "coastal-wave",
  "vintage-ornamental",
  "boho-asymmetric",
  "monogram-crest",
  "folk-ornament",
  "collage-scrapbook",
  "gothic-frame",
  "bare-branch",
  "postage-stamp",
  "victorian-cameo",
  "left-aligned",
  "stacked-grid",
  "watercolor-botanical",
  "alcohol-ink-gold",
];
export const DEFAULT_HERO_VARIANT: HeroVariant = "monogram-center";
