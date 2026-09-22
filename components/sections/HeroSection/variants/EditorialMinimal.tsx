import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./EditorialMinimal.module.css";

/** Editorial minimalism: left-aligned, bottom-anchored, wide-tracked
 * eyebrow, hairline rule -- deliberately not centered, distinct from every
 * other Hero variant, all of which are center-composed. A thin repeating
 * wave-line accent sits in the top-right corner, opposite the content --
 * reads as a quiet horizon line for this variant's coastal users, and as
 * plain abstract geometry for its modern/minimal users (the same shape
 * either way, no per-theme branching). Safe to hard-pin to the corner:
 * this variant is bottom-anchored for the theme gallery's crop (unlike
 * MinimalText/WatercolorBloom's centered variants), matching the existing
 * .rule element's own already-fine positioning. */
export default function EditorialMinimal({ names, eventDate, styleOverrides, eyebrow }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.wave} aria-hidden="true" />
      <div className={styles.block}>
        <span className={styles.eyebrow}>{eyebrow || "Save the date"}</span>
        <p className={styles.names}>
          <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
          {names[1] && (
            <>
              {" & "}
              <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
            </>
          )}
        </p>
        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.date}>{eventDate}</p>
      </div>
    </section>
  );
}
