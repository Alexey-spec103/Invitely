import Embed from "./variants/Embed";
import FullBleed from "./variants/FullBleed";
import FramedPolaroid from "./variants/FramedPolaroid";
import type { VideoSectionProps } from "./types";

export default function VideoSection({ variant, ...variantProps }: VideoSectionProps) {
  switch (variant) {
    case "embed":
      return <Embed {...variantProps} />;
    case "full-bleed":
      return <FullBleed {...variantProps} />;
    case "framed-polaroid":
      return <FramedPolaroid {...variantProps} />;
  }
}
