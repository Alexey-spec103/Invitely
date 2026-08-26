import type { HeroSectionVariantProps } from "../types";
import styles from "./HandLetteringHero.module.css";

/** Hand-lettering/calligraphy hero: the names in huge script are the whole
 * point of the composition -- everything else is small supporting type,
 * the reverse of every other variant where the heading font leads. */
export default function HandLetteringHero({ names, eventDate }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.eyebrow}>We&apos;re getting married</span>
      <p className={styles.names}>{names.join(" & ")}</p>
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
