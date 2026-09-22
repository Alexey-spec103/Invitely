import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { Locale } from "@/lib/i18n/locales";

export type MapVariant = "embed-static" | "side-by-side-cards" | "minimal-list";

export interface MapVenue {
  name: string;
  address: string;
}

export interface MapSectionVariantProps {
  title: string;
  venues: MapVenue[];
  /** See HeroSection/types.ts's identical field for the convention. Field
   * keys for venue rows are "venues.<index>.<name|address>". */
  styleOverrides?: Record<string, TextStyleOverride>;
  /** A plain locale string, not the Dictionary object -- see
   * RsvpSection/types.ts's `locale` field for why. Only used for each
   * embedded map iframe's a11y `title` (never visible text). */
  locale: Locale;
}

export interface MapSectionProps extends MapSectionVariantProps {
  variant: MapVariant;
}
