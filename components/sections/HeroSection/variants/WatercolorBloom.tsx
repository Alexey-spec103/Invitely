import type { HeroSectionVariantProps } from "../types";
import styles from "./WatercolorBloom.module.css";

/** Watercolor: a soft irregular blob shape (CSS-masked SVG, not a photo)
 * sits behind the text like a splash of paint -- the organic, imprecise
 * silhouette is the point, distinct from every hard-edged/geometric variant. */
export default function WatercolorBloom({ names, eventDate }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.blob} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.names}>{names.join(" & ")}</p>
        <p className={styles.date}>{eventDate}</p>
      </div>
    </section>
  );
}
