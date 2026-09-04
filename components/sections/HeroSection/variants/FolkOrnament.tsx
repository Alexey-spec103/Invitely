import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./FolkOrnament.module.css";

/** Folk/Slavic: repeating diamond-motif bands above and below the text,
 * evoking embroidery -- a distinct decorative language from the botanical/
 * geometric/organic motifs used by every other framed variant. */
export default function FolkOrnament({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.band} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.names}>
          <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
          {names[1] && (
            <>
              {" & "}
              <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
            </>
          )}
        </p>
        <p className={styles.date}>{eventDate}</p>
      </div>
      <span className={styles.band} aria-hidden="true" />
    </section>
  );
}
