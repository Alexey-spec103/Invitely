export type MapVariant = "embed-static" | "side-by-side-cards" | "minimal-list";

export interface MapVenue {
  name: string;
  address: string;
}

export interface MapSectionVariantProps {
  title: string;
  venues: MapVenue[];
}

export interface MapSectionProps extends MapSectionVariantProps {
  variant: MapVariant;
}
