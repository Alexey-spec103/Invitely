import SimpleList from "./variants/SimpleList";
import MinimalRows from "./variants/MinimalRows";
import CompactBadges from "./variants/CompactBadges";
import type { GiftSectionProps } from "./types";

export default function GiftSection({ variant, ...variantProps }: GiftSectionProps) {
  switch (variant) {
    case "simple-list":
      return <SimpleList {...variantProps} />;
    case "minimal-rows":
      return <MinimalRows {...variantProps} />;
    case "compact-badges":
      return <CompactBadges {...variantProps} />;
  }
}
