import SimpleForm from "./variants/SimpleForm";
import type { RsvpSectionProps } from "./types";

export default function RsvpSection({ variant, ...variantProps }: RsvpSectionProps) {
  switch (variant) {
    case "simple-form":
      return <SimpleForm {...variantProps} />;
  }
}
