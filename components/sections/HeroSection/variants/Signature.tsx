import type { HeroSectionVariantProps } from "../types";
import styles from "./Signature.module.css";

export default function Signature({ names, eventDate }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.rule} aria-hidden="true" />
      <p className={styles.names}>{names.join(" & ")}</p>
      <span className={styles.rule} aria-hidden="true" />
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
