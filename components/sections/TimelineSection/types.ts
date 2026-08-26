export type TimelineVariant = "vertical-line" | "alternating-sides" | "horizontal-scroll";

export interface TimelineEvent {
  time: string;
  title: string;
  description?: string;
}

export interface TimelineSectionVariantProps {
  title: string;
  events: TimelineEvent[];
}

export interface TimelineSectionProps extends TimelineSectionVariantProps {
  variant: TimelineVariant;
}
