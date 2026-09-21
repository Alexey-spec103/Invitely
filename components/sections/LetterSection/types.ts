import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { ThemeCategory } from "@/lib/themes/types";

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
}

export interface LetterSectionProps extends LetterSectionVariantProps {
  variant: LetterVariant;
}
