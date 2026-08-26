import SimpleDigits from "./variants/SimpleDigits";
import CircularRings from "./variants/CircularRings";
import MinimalInline from "./variants/MinimalInline";
import type { CountdownSectionProps } from "./types";

export default function CountdownSection({ variant, ...variantProps }: CountdownSectionProps) {
  switch (variant) {
    case "simple-digits":
      return <SimpleDigits {...variantProps} />;
    case "circular-rings":
      return <CircularRings {...variantProps} />;
    case "minimal-inline":
      return <MinimalInline {...variantProps} />;
  }
}
