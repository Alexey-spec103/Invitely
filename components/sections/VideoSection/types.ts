import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";

export type VideoVariant = "embed" | "full-bleed" | "framed-polaroid";

export interface VideoSectionVariantProps {
  title?: string;
  videoUrl: string;
  styleOverrides?: Record<string, TextStyleOverride>;
}

export interface VideoSectionProps extends VideoSectionVariantProps {
  variant: VideoVariant;
}
