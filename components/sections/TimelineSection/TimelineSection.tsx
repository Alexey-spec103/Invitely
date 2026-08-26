import VerticalLine from "./variants/VerticalLine";
import AlternatingSides from "./variants/AlternatingSides";
import HorizontalScroll from "./variants/HorizontalScroll";
import type { TimelineSectionProps } from "./types";

export default function TimelineSection({ variant, ...variantProps }: TimelineSectionProps) {
  switch (variant) {
    case "vertical-line":
      return <VerticalLine {...variantProps} />;
    case "alternating-sides":
      return <AlternatingSides {...variantProps} />;
    case "horizontal-scroll":
      return <HorizontalScroll {...variantProps} />;
  }
}
