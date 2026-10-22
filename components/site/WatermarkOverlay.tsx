import styles from "./WatermarkOverlay.module.css";

// impeccable critique (2026-10-22): the live detector logged 10 distinct
// text-occlusion events against the RSVP form alone at the original 9x6
// density -- legible enough to compete with the couple's own names in Hero
// and to run directly behind active form fields. Thinned to 6x4 (still a
// full-bleed grid across the oversized rotated field above, so there's no
// uncovered gap a screenshot could crop around) and paired with the lower
// opacity below to read as a watermark again rather than a repeating
// pattern fighting for attention.
const ROWS = 6;
const COLS = 4;
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
