import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { ThemeCategory } from "@/lib/themes/types";

export type CountdownVariant = "simple-digits" | "circular-rings" | "minimal-inline";

export interface CountdownSectionVariantProps {
  title?: string;
  eventDateTime: string;
  styleOverrides?: Record<string, TextStyleOverride>;
  themeCategory?: ThemeCategory;
}

export interface CountdownSectionProps extends CountdownSectionVariantProps {
  variant: CountdownVariant;
}
