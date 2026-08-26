import type { HeroSectionVariantProps } from "../types";
import styles from "./MonogramCenter.module.css";

function getInitials(names: string[]): string {
  return names
    .map((name) => name.trim().charAt(0))
    .join("")
    .toUpperCase();
}

export default function MonogramCenter({
  names,
  eventDate,
  monogramInitials,
}: HeroSectionVariantProps) {
  const initials = monogramInitials?.trim() || getInitials(names);

  return (
    <section className={styles.section}>
      <div className={styles.monogram} aria-hidden="true">
        {initials}
      </div>
      <p className={styles.names}>{names.join(" & ")}</p>
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
