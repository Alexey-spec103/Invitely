import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { ThemeCategory } from "@/lib/themes/types";
import type { Locale } from "@/lib/i18n/locales";

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
  styleOverrides?: Record<string, TextStyleOverride>;
  themeCategory?: ThemeCategory;
  /** A plain locale string, not the Dictionary object -- see
   * RsvpSection/types.ts's `locale` field for why. Only SimpleList/
   * MinimalRows actually use it (their "View" link text); CompactBadges has
   * no chrome of its own to translate and simply ignores the prop. */
  locale: Locale;
}

export interface GiftSectionProps extends GiftSectionVariantProps {
  variant: GiftVariant;
}
