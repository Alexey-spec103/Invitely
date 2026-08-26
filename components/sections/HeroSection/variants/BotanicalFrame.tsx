import type { HeroSectionVariantProps } from "../types";
import styles from "./BotanicalFrame.module.css";

/** Botanical illustration/line-art: a decorative frame at all 4 corners
 * with text in the clear center -- no photo at all, unlike every other
 * variant that either omits imagery entirely or leans on a photo. */
export default function BotanicalFrame({ names, eventDate }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <span className={styles.flourish} data-pos="tl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="tr" aria-hidden="true" />
        <span className={styles.flourish} data-pos="bl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="br" aria-hidden="true" />
        <div className={styles.content}>
          <p className={styles.names}>{names.join(" & ")}</p>
          <span className={styles.divider} aria-hidden="true" />
          <p className={styles.date}>{eventDate}</p>
        </div>
      </div>
    </section>
  );
}
