import type { HeroSectionVariantProps } from "../types";
import styles from "./CoastalWave.module.css";

/** Coastal/Mediterranean: content sits in a wide, airy upper zone; a
 * horizon-line wave band anchors the bottom of the viewport -- the only
 * variant with a distinct horizontal "sky over sea" zoning. */
export default function CoastalWave({ names, eventDate }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <p className={styles.names}>{names.join(" & ")}</p>
        <p className={styles.date}>{eventDate}</p>
      </div>
      <div className={styles.horizon} aria-hidden="true" />
    </section>
  );
}
