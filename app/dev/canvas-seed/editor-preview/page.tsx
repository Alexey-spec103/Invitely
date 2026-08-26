import CanvasEditor from "@/app/dashboard/[eventId]/canvas/CanvasEditor";
import { seedHeroFrame } from "@/lib/canvas/seed";

/** Interaction check for CanvasEditor (drag/resize/rotate/fonts/color),
 * independent of the DB round-trip — same reasoning as
 * app/dev/canvas-seed/preview. The Save button will error here (no real
 * event/site_config row behind "dev-preview-event"), everything else is
 * live and testable. */
export default function CanvasEditorPreviewPage() {
  return <CanvasEditor eventId="dev-preview-event" initialFrames={[seedHeroFrame]} />;
}
