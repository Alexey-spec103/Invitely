export { default as VideoSection } from "./VideoSection";
export type { VideoSectionProps, VideoSectionVariantProps, VideoVariant } from "./types";

import type { VideoVariant } from "./types";

export const VIDEO_VARIANTS: VideoVariant[] = ["embed", "full-bleed", "framed-polaroid"];
export const DEFAULT_VIDEO_VARIANT: VideoVariant = "embed";
