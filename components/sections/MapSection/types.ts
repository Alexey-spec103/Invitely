import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";

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
}

export interface MapSectionProps extends MapSectionVariantProps {
  variant: MapVariant;
}
