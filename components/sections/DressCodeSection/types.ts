import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";

export type DressCodeVariant = "color-palette" | "swatch-grid" | "minimal-stripe";

export interface DressCodeColor {
  hex: string;
  label?: string;
}

export interface DressCodeSectionVariantProps {
  title: string;
  description?: string;
  colors: DressCodeColor[];
  styleOverrides?: Record<string, TextStyleOverride>;
}

export interface DressCodeSectionProps extends DressCodeSectionVariantProps {
  variant: DressCodeVariant;
}
