import CanvasRenderer from "@/components/canvas/CanvasRenderer";
import { seedHeroFrame } from "@/lib/canvas/seed";

/** Pure rendering check for CanvasRenderer, independent of the DB round-trip
 * (site_config.layout_mode/canvas) — useful while that migration is
 * pending. No auth, no data fetch, same throwaway-tooling convention as
 * app/dev/themes. */
export default function CanvasSeedPreviewPage() {
  return <CanvasRenderer frames={[seedHeroFrame]} />;
}
