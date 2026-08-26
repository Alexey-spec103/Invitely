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
  | "collage-scrapbook";

export interface HeroSectionVariantProps {
  names: string[];
  eventDate: string;
  photoUrl?: string;
  monogramInitials?: string;
}

export interface HeroSectionProps extends HeroSectionVariantProps {
  variant: HeroVariant;
}
