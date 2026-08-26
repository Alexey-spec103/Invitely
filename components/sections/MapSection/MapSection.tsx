import EmbedStatic from "./variants/EmbedStatic";
import SideBySideCards from "./variants/SideBySideCards";
import MinimalList from "./variants/MinimalList";
import type { MapSectionProps } from "./types";

export default function MapSection({ variant, ...variantProps }: MapSectionProps) {
  switch (variant) {
    case "embed-static":
      return <EmbedStatic {...variantProps} />;
    case "side-by-side-cards":
      return <SideBySideCards {...variantProps} />;
    case "minimal-list":
      return <MinimalList {...variantProps} />;
  }
}
