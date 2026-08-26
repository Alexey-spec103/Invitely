import SimpleLookup from "./variants/SimpleLookup";
import type { BanquetNavigatorSectionProps } from "./types";

export default function BanquetNavigatorSection({ variant, ...variantProps }: BanquetNavigatorSectionProps) {
  switch (variant) {
    case "simple-lookup":
      return <SimpleLookup {...variantProps} />;
  }
}
