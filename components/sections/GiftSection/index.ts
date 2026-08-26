export { default as GiftSection } from "./GiftSection";
export type {
  GiftSectionProps,
  GiftSectionVariantProps,
  GiftVariant,
  GiftPreferenceItem,
} from "./types";

import type { GiftVariant } from "./types";

export const GIFT_VARIANTS: GiftVariant[] = ["simple-list", "minimal-rows", "compact-badges"];
export const DEFAULT_GIFT_VARIANT: GiftVariant = "simple-list";
