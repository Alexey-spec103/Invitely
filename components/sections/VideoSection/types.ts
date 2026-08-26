export type VideoVariant = "embed" | "full-bleed" | "framed-polaroid";

export interface VideoSectionVariantProps {
  title?: string;
  videoUrl: string;
}

export interface VideoSectionProps extends VideoSectionVariantProps {
  variant: VideoVariant;
}
