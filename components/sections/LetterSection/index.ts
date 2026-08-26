export { default as LetterSection } from "./LetterSection";
export type { LetterSectionProps, LetterSectionVariantProps, LetterVariant } from "./types";

import type { LetterVariant } from "./types";

export const LETTER_VARIANTS: LetterVariant[] = [
  "centered-card",
  "minimal-line",
  "ornate-border",
  "split-quote",
];
export const DEFAULT_LETTER_VARIANT: LetterVariant = "centered-card";
