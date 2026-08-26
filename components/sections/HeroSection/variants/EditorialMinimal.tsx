import type { HeroSectionVariantProps } from "../types";
import styles from "./EditorialMinimal.module.css";

/** Editorial minimalism: left-aligned, bottom-anchored, wide-tracked
 * eyebrow, hairline rule -- deliberately not centered, distinct from every
 * other Hero variant, all of which are center-composed. */
export default function EditorialMinimal({ names, eventDate }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.block}>
        <span className={styles.eyebrow}>Save the date</span>
        <p className={styles.names}>{names.join(" & ")}</p>
        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.date}>{eventDate}</p>
      </div>
    </section>
  );
}
