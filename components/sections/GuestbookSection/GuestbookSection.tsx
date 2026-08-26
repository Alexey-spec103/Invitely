import Wall from "./variants/Wall";
import QuoteScroll from "./variants/QuoteScroll";
import MinimalList from "./variants/MinimalList";
import type { GuestbookSectionProps } from "./types";

export default function GuestbookSection({ variant, ...variantProps }: GuestbookSectionProps) {
  switch (variant) {
    case "wall":
      return <Wall {...variantProps} />;
    case "quote-scroll":
      return <QuoteScroll {...variantProps} />;
    case "minimal-list":
      return <MinimalList {...variantProps} />;
  }
}
