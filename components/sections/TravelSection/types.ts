import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { ThemeCategory } from "@/lib/themes/types";
import type { Locale } from "@/lib/i18n/locales";

export type TravelVariant = "simple-list";

export interface TravelItem {
  name: string;
  description?: string;
  promoCode?: string;
  priceText?: string;
  bookingUrl?: string;
}

export interface TravelSectionVariantProps {
  title?: string;
  description?: string;
  /** Field keys for item rows are
   * "items.<index>.<name|description|promoCode|priceText>" -- bookingUrl is
   * edited via TravelItemsManager, not inline, same reasoning as Gift's own
   * `url` field (a link target isn't guest-facing clickable text). */
  items: TravelItem[];
  styleOverrides?: Record<string, TextStyleOverride>;
  themeCategory?: ThemeCategory;
  locale: Locale;
}

export interface TravelSectionProps extends TravelSectionVariantProps {
  variant: TravelVariant;
}
