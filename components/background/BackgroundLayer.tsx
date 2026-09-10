import type { BackgroundFill } from "@/lib/backgroundFills";
import { backgroundFillCss } from "@/lib/backgroundFills";

interface BackgroundLayerProps {
  fill?: BackgroundFill;
}

/** dashboard-audit.md B12: renders a `BackgroundFill` as an absolutely
 * positioned overlay with its own opacity, rather than a plain CSS
 * `background` + `opacity` on the container -- a container-level opacity
 * would fade the real content too, not just the fill. `zIndex: -1` paints
 * this behind sibling content regardless of that content's own position/
 * z-index (CSS stacking order paints negative-z-index descendants before
 * everything else in the same stacking context) -- the only requirement on
 * the caller is that its own container is `position: relative` (or already
 * positioned) so this doesn't escape to a further ancestor. */
export default function BackgroundLayer({ fill }: BackgroundLayerProps) {
  if (!fill) return null;
  const css = backgroundFillCss(fill);
  if (!css) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        background: css,
        opacity: (fill.opacity ?? 100) / 100,
        pointerEvents: "none",
      }}
    />
  );
}
