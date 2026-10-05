export { default as GuestNotesSection } from "./GuestNotesSection";
export type { GuestNotesSectionProps, GuestNotesSectionVariantProps, GuestNotesVariant } from "./types";

import type { GuestNotesVariant } from "./types";

export const GUEST_NOTES_VARIANTS: GuestNotesVariant[] = ["simple-note"];
export const DEFAULT_GUEST_NOTES_VARIANT: GuestNotesVariant = "simple-note";
