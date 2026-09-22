import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { ThemeCategory } from "@/lib/themes/types";
import type { Locale } from "@/lib/i18n/locales";

export type LetterVariant = "centered-card" | "minimal-line" | "ornate-border" | "split-quote";

export interface LetterSectionVariantProps {
  title: string;
  body: string;
  quote: string;
  note?: string;
  rsvpDeadline?: string;
  closingLine?: string;
  /** See HeroSection/types.ts's identical field for the convention. */
  styleOverrides?: Record<string, TextStyleOverride>;
  themeCategory?: ThemeCategory;
  /** A plain locale string, not the Dictionary object -- see
   * RsvpSection/types.ts's `locale` field for why. Used for both the
   * "Please confirm by..." chrome string and -- importantly -- the RSVP
   * deadline date's own formatting, which was hardcoded to "en-US" regardless
   * of the guest's actual language (see lib/i18n/locales.ts's
   * LOCALE_TO_BCP47 for the mapping used to fix that). */
  locale: Locale;
}

export interface LetterSectionProps extends LetterSectionVariantProps {
  variant: LetterVariant;
}
