import type { HeroSectionVariantProps } from "../types";
import styles from "./PhotoFullBleed.module.css";

export default function PhotoFullBleed({
  names,
  eventDate,
  photoUrl,
}: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className={styles.photo} />
      )}
      <div className={styles.overlay} />
      <div className={styles.content}>
        <p className={styles.names}>{names.join(" & ")}</p>
        <p className={styles.date}>{eventDate}</p>
      </div>
    </section>
  );
}
