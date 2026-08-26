import type { HeroSectionVariantProps } from "../types";
import styles from "./ArtDecoCrest.module.css";

/** Art Deco: symmetric geometric zigzag bands (pure CSS, not an image)
 * top and bottom of a framed plate, wide-tracked caps -- the geometric
 * repetition is the whole point, distinct from every organic/botanical
 * variant elsewhere in the catalog. */
export default function ArtDecoCrest({ names, eventDate }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.plate}>
        <span className={styles.zigzag} aria-hidden="true" />
        <p className={styles.names}>{names.join(" & ")}</p>
        <p className={styles.date}>{eventDate}</p>
        <span className={styles.zigzag} aria-hidden="true" />
      </div>
    </section>
  );
}
