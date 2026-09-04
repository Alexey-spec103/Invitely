import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";

export type TimelineVariant = "vertical-line" | "alternating-sides" | "horizontal-scroll";

export interface TimelineEvent {
  time: string;
  title: string;
  description?: string;
}

export interface TimelineSectionVariantProps {
  title: string;
  events: TimelineEvent[];
  /** See HeroSection/types.ts's identical field for the convention. Field
   * keys for event rows are "events.<index>.<time|title|description>". */
  styleOverrides?: Record<string, TextStyleOverride>;
}

export interface TimelineSectionProps extends TimelineSectionVariantProps {
  variant: TimelineVariant;
}
