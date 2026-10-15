import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import EditablePhoto from "../EditablePhoto";
import styles from "./StackedGrid.module.css";

/** Minimal: a Swiss-poster-style 2x2 grid -- first name top-left, second
 * name bottom-right, date in its own corner. A genuine structural variant
 * (grid, not a centered or left-aligned block), echoing the Swiss-grid
 * aesthetic already implied by several minimal theme names ("Lilac Grid",
 * "Sage Grid") without needing any texture. Two open corner brackets are
 * the only decoration -- plain CSS borders, no image/SVG asset -- framing
 * the two empty grid cells (top-right, bottom-left) the names don't
 * occupy, so the grid reads as a deliberate 4-corner composition rather
 * than half-empty. Kept deliberately quiet, matching the category's
 * other bare-by-design variants.
 *
 * theme-photo-fallback QA report (2026-10-13): when a host has a photo, it
 * fills the top-right grid cell as a real photo (the cell the bracket used
 * to just frame empty) -- the bottom-left bracket stays either way, so the
 * composition still reads as a deliberate 4-corner grid. No photo: exactly
 * the original two-bracket layout, unchanged. */
export default function StackedGrid({ names, eventDate, photoUrl, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      {photoUrl ? (
        <span className={styles.photoCell}>
          <EditablePhoto src={photoUrl} className={styles.photo} alt={names.filter(Boolean).join(" & ")} />
        </span>
      ) : (
        <span className={styles.cornerTopRight} aria-hidden="true" />
      )}
      <span className={styles.cornerBottomLeft} aria-hidden="true" />
      {/* Accessibility fix (2026-10-15): the couple's names are the page's
          de facto title, but name1/name2 are two independently-positioned
          grid items (explicit grid-column/row below, not DOM-order
          auto-placement), not a single element an <h1> could wrap in place.
          `display: contents` makes the h1 itself layout-transparent -- its
          two span children keep behaving as direct grid items, placed
          exactly as before -- while still giving the page one real <h1> in
          the accessibility tree. Reordered next to each other in the DOM
          (date moved after) since grid position is driven entirely by their
          own explicit grid-column/grid-row, not DOM order, so this is safe. */}
      <h1 style={{ display: "contents" }}>
        <span className={styles.name1}>
          <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
        </span>
        {names[1] && (
          <span className={styles.name2}>
            <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
          </span>
        )}
      </h1>
      <span className={styles.date}>{eventDate}</span>
    </section>
  );
}
