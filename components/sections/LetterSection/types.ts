export type LetterVariant = "centered-card" | "minimal-line" | "ornate-border" | "split-quote";

export interface LetterSectionVariantProps {
  title: string;
  body: string;
  quote: string;
  note?: string;
  rsvpDeadline?: string;
  closingLine?: string;
}

export interface LetterSectionProps extends LetterSectionVariantProps {
  variant: LetterVariant;
}
