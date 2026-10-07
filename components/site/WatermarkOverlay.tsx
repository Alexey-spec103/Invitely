import styles from "./WatermarkOverlay.module.css";

const ROWS = 9;
const COLS = 6;
const TILE_COUNT = ROWS * COLS;

/** Replaces the old single corner badge for Free-tier guest sites --
 * confirmed live, that badge was one `position: fixed` element sitting
 * inside a small, easily-cropped corner: a screenshot framed to exclude it,
 * or a one-click devtools delete, produced an indistinguishable "clean"
 * invitation a host could hand to real guests without ever paying for the
 * â‚¬19 link. A tiled field covering the whole viewport can still be stripped
 * by anyone determined enough to open devtools (no client-side watermark
 * can prevent that), but it can't be framed out of a casual screenshot or
 * phone photo, which is the realistic threat this exists for -- raising the
 * bar for the common case, not promising to defeat a determined one.
 * `pointer-events: none` throughout so it never blocks a real click on the
 * actual site underneath. Plain repeated DOM text, not a CSS background
 * image, specifically so it inherits `--theme-accent` like every other
 * accent-colored element in this codebase instead of needing a second,
 * separately-maintained color for an SVG data URI that can't read CSS
 * custom properties. */
export default function WatermarkOverlay() {
  return (
    <div className={styles.field} aria-hidden="true">
      <div className={styles.grid}>
        {Array.from({ length: TILE_COUNT }, (_, i) => (
          <span key={i} className={styles.tile}>
            Invimbo
          </span>
        ))}
      </div>
    </div>
  );
}
