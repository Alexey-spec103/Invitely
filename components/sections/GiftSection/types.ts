export type GiftVariant = "simple-list" | "minimal-rows" | "compact-badges";

export interface GiftPreferenceItem {
  id: string;
  title: string;
  type: string;
  url: string | null;
  imageUrl: string | null;
  description: string | null;
}

export interface GiftSectionVariantProps {
  title?: string;
  description?: string;
  preferences: GiftPreferenceItem[];
}

export interface GiftSectionProps extends GiftSectionVariantProps {
  variant: GiftVariant;
}
