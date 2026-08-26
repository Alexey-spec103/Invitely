import type { HeroSectionVariantProps } from "../types";
import styles from "./MonogramCrest.module.css";

function getInitials(names: string[]): string {
  return names
    .map((name) => name.trim().charAt(0))
    .join("")
    .toUpperCase();
}

/** Monogram crest: a solid shield/seal shape (CSS clip-path), not an
 * outlined circle -- the initials read as a wax-seal emblem and are the
 * dominant visual element, names/date reduced to a caption underneath. */
export default function MonogramCrest({
  names,
  eventDate,
  monogramInitials,
}: HeroSectionVariantProps) {
  const initials = monogramInitials?.trim() || getInitials(names);

  return (
    <section className={styles.section}>
      <div className={styles.seal} aria-hidden="true">
        <span className={styles.initials}>{initials}</span>
      </div>
      <p className={styles.names}>{names.join(" & ")}</p>
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
