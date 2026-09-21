import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { ThemeCategory } from "@/lib/themes/types";

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
  themeCategory?: ThemeCategory;
}

export interface DressCodeSectionProps extends DressCodeSectionVariantProps {
  variant: DressCodeVariant;
}
