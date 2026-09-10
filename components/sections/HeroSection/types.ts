import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";

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
}

export interface HeroSectionProps extends HeroSectionVariantProps {
  variant: HeroVariant;
}
