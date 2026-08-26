import type { HeroSectionVariantProps } from "../types";
import styles from "./CollageScrapbook.module.css";

/** Collage/scrapbook: a tilted "photo print" with a washi-tape corner and
 * a handwritten-style caption -- the only variant that reads as a physical
 * object pinned to a page rather than a clean typographic composition. */
export default function CollageScrapbook({
  names,
  eventDate,
  photoUrl,
}: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.print}>
        <span className={styles.tape} aria-hidden="true" />
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className={styles.photo} />
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>
      <p className={styles.note}>{names.join(" & ")}</p>
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
