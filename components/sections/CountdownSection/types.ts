import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";

export type CountdownVariant = "simple-digits" | "circular-rings" | "minimal-inline";

export interface CountdownSectionVariantProps {
  title?: string;
  eventDateTime: string;
  styleOverrides?: Record<string, TextStyleOverride>;
}

export interface CountdownSectionProps extends CountdownSectionVariantProps {
  variant: CountdownVariant;
}
