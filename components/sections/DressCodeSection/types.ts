export type DressCodeVariant = "color-palette" | "swatch-grid" | "minimal-stripe";

export interface DressCodeColor {
  hex: string;
  label?: string;
}

export interface DressCodeSectionVariantProps {
  title: string;
  description?: string;
  colors: DressCodeColor[];
}

export interface DressCodeSectionProps extends DressCodeSectionVariantProps {
  variant: DressCodeVariant;
}
