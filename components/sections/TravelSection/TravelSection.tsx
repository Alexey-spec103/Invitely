import SimpleList from "./variants/SimpleList";
import type { TravelSectionProps } from "./types";

export default function TravelSection({ variant, ...variantProps }: TravelSectionProps) {
  switch (variant) {
    case "simple-list":
      return <SimpleList {...variantProps} />;
  }
}
