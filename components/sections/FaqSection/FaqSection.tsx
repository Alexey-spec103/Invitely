import SimpleList from "./variants/SimpleList";
import type { FaqSectionProps } from "./types";

export default function FaqSection({ variant, ...variantProps }: FaqSectionProps) {
  switch (variant) {
    case "simple-list":
      return <SimpleList {...variantProps} />;
  }
}
