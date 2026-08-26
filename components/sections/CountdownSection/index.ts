export { default as CountdownSection } from "./CountdownSection";
export type {
  CountdownSectionProps,
  CountdownSectionVariantProps,
  CountdownVariant,
} from "./types";

import type { CountdownVariant } from "./types";

export const COUNTDOWN_VARIANTS: CountdownVariant[] = [
  "simple-digits",
  "circular-rings",
  "minimal-inline",
];
export const DEFAULT_COUNTDOWN_VARIANT: CountdownVariant = "simple-digits";
