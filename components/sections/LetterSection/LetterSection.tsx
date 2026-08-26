import CenteredCard from "./variants/CenteredCard";
import MinimalLine from "./variants/MinimalLine";
import OrnateBorder from "./variants/OrnateBorder";
import SplitQuote from "./variants/SplitQuote";
import type { LetterSectionProps } from "./types";

export default function LetterSection({ variant, ...variantProps }: LetterSectionProps) {
  switch (variant) {
    case "centered-card":
      return <CenteredCard {...variantProps} />;
    case "minimal-line":
      return <MinimalLine {...variantProps} />;
    case "ornate-border":
      return <OrnateBorder {...variantProps} />;
    case "split-quote":
      return <SplitQuote {...variantProps} />;
  }
}
