import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./EditorialMinimal.module.css";

/** Editorial minimalism: left-aligned, bottom-anchored, wide-tracked
 * eyebrow, hairline rule -- deliberately not centered, distinct from every
 * other Hero variant, all of which are center-composed. */
export default function EditorialMinimal({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.block}>
        <span className={styles.eyebrow}>Save the date</span>
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
