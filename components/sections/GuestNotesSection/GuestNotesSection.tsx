import SimpleNote from "./variants/SimpleNote";
import type { GuestNotesSectionProps } from "./types";

export default function GuestNotesSection({ variant, ...variantProps }: GuestNotesSectionProps) {
  switch (variant) {
    case "simple-note":
      return <SimpleNote {...variantProps} />;
  }
}
