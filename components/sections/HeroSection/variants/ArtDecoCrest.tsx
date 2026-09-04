import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./ArtDecoCrest.module.css";

/** Art Deco: symmetric geometric zigzag bands (pure CSS, not an image)
 * top and bottom of a framed plate, wide-tracked caps -- the geometric
 * repetition is the whole point, distinct from every organic/botanical
 * variant elsewhere in the catalog. */
export default function ArtDecoCrest({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.plate}>
        <span className={styles.crest} aria-hidden="true" />
        <span className={styles.zigzag} aria-hidden="true" />
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
        <span className={styles.zigzag} aria-hidden="true" />
      </div>
    </section>
  );
}
