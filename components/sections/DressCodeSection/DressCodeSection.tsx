import ColorPalette from "./variants/ColorPalette";
import SwatchGrid from "./variants/SwatchGrid";
import MinimalStripe from "./variants/MinimalStripe";
import type { DressCodeSectionProps } from "./types";

export default function DressCodeSection({ variant, ...variantProps }: DressCodeSectionProps) {
  switch (variant) {
    case "color-palette":
      return <ColorPalette {...variantProps} />;
    case "swatch-grid":
      return <SwatchGrid {...variantProps} />;
    case "minimal-stripe":
      return <MinimalStripe {...variantProps} />;
  }
}
