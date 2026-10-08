import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { ThemeCategory } from "@/lib/themes/types";

export type FaqVariant = "simple-list";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionVariantProps {
  title?: string;
  /** Field keys for item rows are "items.<index>.<question|answer>", same
   * convention as TimelineSection's `events`. */
  items: FaqItem[];
  styleOverrides?: Record<string, TextStyleOverride>;
  themeCategory?: ThemeCategory;
}

export interface FaqSectionProps extends FaqSectionVariantProps {
  variant: FaqVariant;
}
