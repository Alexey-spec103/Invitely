export { default as TimelineSection } from "./TimelineSection";
export type {
  TimelineSectionProps,
  TimelineSectionVariantProps,
  TimelineVariant,
  TimelineEvent,
} from "./types";

import type { TimelineVariant } from "./types";

export const TIMELINE_VARIANTS: TimelineVariant[] = [
  "vertical-line",
  "alternating-sides",
  "horizontal-scroll",
];
export const DEFAULT_TIMELINE_VARIANT: TimelineVariant = "vertical-line";
