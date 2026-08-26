import type { HeroSectionVariantProps } from "../types";
import styles from "./EditorialSplit.module.css";

function getInitials(names: string[]): [string, string] {
  const a = names[0]?.trim().charAt(0).toUpperCase() ?? "";
  const b = (names[1] ?? names[0])?.trim().charAt(0).toUpperCase() ?? "";
  return [a, b];
}

export default function EditorialSplit({
  names,
  eventDate,
  photoUrl,
  monogramInitials,
}: HeroSectionVariantProps) {
  const [initialA, initialB] = monogramInitials?.trim()
    ? [monogramInitials.trim().charAt(0).toUpperCase(), monogramInitials.trim().charAt(1)?.toUpperCase() ?? ""]
    : getInitials(names);

  return (
    <section className={styles.section}>
      <div className={styles.textCol}>
        <span className={styles.bigLetter} aria-hidden="true">
          {initialA}
        </span>
        <p className={styles.names}>
          {names[0]}
          {names[1] && <span className={styles.ampersand}>&amp;</span>}
          {names[1]}
        </p>
        <p className={styles.date}>{eventDate}</p>
        <span className={`${styles.bigLetter} ${styles.bigLetterSecond}`} aria-hidden="true">
          {initialB}
        </span>
      </div>

      {photoUrl && (
        <div className={styles.photoCol}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="" className={styles.photo} />
        </div>
      )}
    </section>
  );
}
