import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { ThemeCategory } from "@/lib/themes/types";

export type HeroVariant =
  | "monogram-center"
  | "photo-full-bleed"
  | "minimal-text"
  | "editorial-split"
  | "signature"
  | "editorial-minimal"
  | "botanical-frame"
  | "hand-lettering"
  | "letterpress"
  | "art-deco-crest"
  | "watercolor-bloom"
  | "coastal-wave"
  | "vintage-ornamental"
  | "boho-asymmetric"
  | "monogram-crest"
  | "folk-ornament"
  | "collage-scrapbook"
  | "gothic-frame"
  | "bare-branch"
  | "postage-stamp"
  | "victorian-cameo"
  | "left-aligned"
  | "stacked-grid"
  | "watercolor-botanical"
  | "alcohol-ink-gold";

export interface HeroSectionVariantProps {
  names: string[];
  eventDate: string;
  photoUrl?: string;
  monogramInitials?: string;
  /** Per-instance size/weight/color/align overrides, keyed by field name
   * (e.g. "names", "date"). Rendered unconditionally (this is data, not
   * editor chrome) -- see components/site-editor/EditableFieldContext.tsx. */
  styleOverrides?: Record<string, TextStyleOverride>;
  /** The active theme's category, e.g. "boho" or "rustic". Several Hero
   * variants are shared across more than one category's recommended
   * shortlist (CATEGORY_HERO_VARIANTS in recommendedHeroVariant.ts) --
   * a variant that wants to show a category-specific full-color decorative
   * illustration (vs. the theme-accent-tinted single-color masks every
   * variant falls back to) needs this to know which category it's actually
   * rendering for, since it otherwise only ever sees CSS custom properties.
   * Optional because most variants don't need it and some call sites
   * (marketing/theme-gallery previews) don't have a real category to pass. */
  themeCategory?: ThemeCategory;
}

export interface HeroSectionProps extends HeroSectionVariantProps {
  variant: HeroVariant;
}
