import type { HeroSectionVariantProps } from "../types";
import styles from "./MinimalText.module.css";

export default function MinimalText({
  names,
  eventDate,
}: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <p className={styles.names}>
        {names[0]}
        {names[1] && (
          <>
            <span className={styles.divider} aria-hidden="true" />
            {names[1]}
          </>
        )}
      </p>
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
