export { default as DressCodeSection } from "./DressCodeSection";
export type {
  DressCodeSectionProps,
  DressCodeSectionVariantProps,
  DressCodeVariant,
  DressCodeColor,
} from "./types";

import type { DressCodeVariant } from "./types";

export const DRESS_CODE_VARIANTS: DressCodeVariant[] = [
  "color-palette",
  "swatch-grid",
  "minimal-stripe",
];
export const DEFAULT_DRESS_CODE_VARIANT: DressCodeVariant = "color-palette";
