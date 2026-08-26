import type { HeroSectionVariantProps } from "../types";
import styles from "./BohoAsymmetric.module.css";

/** Boho: deliberately off-center -- content anchored bottom-left, a
 * cluster of leaf motifs floating top-right instead of a symmetric frame
 * or centered composition. The asymmetry itself is the archetype. */
export default function BohoAsymmetric({ names, eventDate }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.sprig} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.names}>{names.join(" & ")}</p>
        <p className={styles.date}>{eventDate}</p>
      </div>
    </section>
  );
}
