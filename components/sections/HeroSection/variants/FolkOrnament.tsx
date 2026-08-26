import type { HeroSectionVariantProps } from "../types";
import styles from "./FolkOrnament.module.css";

/** Folk/Slavic: repeating diamond-motif bands above and below the text,
 * evoking embroidery -- a distinct decorative language from the botanical/
 * geometric/organic motifs used by every other framed variant. */
export default function FolkOrnament({ names, eventDate }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.band} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.names}>{names.join(" & ")}</p>
        <p className={styles.date}>{eventDate}</p>
      </div>
      <span className={styles.band} aria-hidden="true" />
    </section>
  );
}
