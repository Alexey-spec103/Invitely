import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { ThemeCategory } from "@/lib/themes/types";
import type { Locale } from "@/lib/i18n/locales";

export type CountdownVariant = "simple-digits" | "circular-rings" | "minimal-inline";

export interface CountdownSectionVariantProps {
  title?: string;
  eventDateTime: string;
  styleOverrides?: Record<string, TextStyleOverride>;
  themeCategory?: ThemeCategory;
  /** A plain locale string, not the Dictionary object -- see
   * RsvpSection/types.ts's `locale` field for why (Dictionary's
   * parameterized entries are plain functions, which can't cross the
   * Server-to-Client boundary as props). Every "use client" variant below
   * resolves its own dictionary locally via getDictionary(locale). */
  locale: Locale;
}

export interface CountdownSectionProps extends CountdownSectionVariantProps {
  variant: CountdownVariant;
}
