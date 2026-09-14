import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
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
 * other bare-by-design variants. */
export default function StackedGrid({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.cornerTopRight} aria-hidden="true" />
      <span className={styles.cornerBottomLeft} aria-hidden="true" />
      <span className={styles.name1}>
        <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
      </span>
      <span className={styles.date}>{eventDate}</span>
      {names[1] && (
        <span className={styles.name2}>
          <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
        </span>
      )}
    </section>
  );
}
