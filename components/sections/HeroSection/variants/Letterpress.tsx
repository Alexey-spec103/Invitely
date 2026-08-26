import type { HeroSectionVariantProps } from "../types";
import styles from "./Letterpress.module.css";

/** Archival/letterpress: a double-ruled plate, deliberately monochrome
 * (names in text color, not accent) and all-caps -- reads as ink-on-paper
 * rather than a colorful modern invitation. */
export default function Letterpress({ names, eventDate }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.plate}>
        <span className={styles.eyebrow}>Save the Date</span>
        <p className={styles.names}>{names.join(" and ")}</p>
        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.date}>{eventDate}</p>
      </div>
    </section>
  );
}
