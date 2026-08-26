export { default as GuestbookSection } from "./GuestbookSection";
export type {
  GuestbookSectionProps,
  GuestbookSectionVariantProps,
  GuestbookMessageItem,
  GuestbookVariant,
} from "./types";

import type { GuestbookVariant } from "./types";

export const GUESTBOOK_VARIANTS: GuestbookVariant[] = ["wall", "quote-scroll", "minimal-list"];
export const DEFAULT_GUESTBOOK_VARIANT: GuestbookVariant = "wall";
