import type { HeroSectionVariantProps } from "../types";
import styles from "./VintageOrnamental.module.css";

/** Vintage/Regency: a double-ruled frame *combined* with corner flourishes
 * (BotanicalFrame and Letterpress each use only one of these devices) --
 * the busier, more ornate combination reads as antique stationery. */
export default function VintageOrnamental({ names, eventDate }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <span className={styles.flourish} data-pos="tl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="tr" aria-hidden="true" />
        <span className={styles.flourish} data-pos="bl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="br" aria-hidden="true" />
        <div className={styles.inner}>
          <p className={styles.names}>{names.join(" & ")}</p>
          <p className={styles.date}>{eventDate}</p>
        </div>
      </div>
    </section>
  );
}
