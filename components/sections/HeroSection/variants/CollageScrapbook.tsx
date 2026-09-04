import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./CollageScrapbook.module.css";

/** Collage/scrapbook: a tilted "photo print" with a washi-tape corner and
 * a handwritten-style caption -- the only variant that reads as a physical
 * object pinned to a page rather than a clean typographic composition. */
export default function CollageScrapbook({
  names,
  eventDate,
  photoUrl,
  styleOverrides,
}: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      {photoUrl && (
        <div className={styles.print}>
          <span className={styles.tape} aria-hidden="true" />
          <span className={styles.sprig} aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="" className={styles.photo} />
        </div>
      )}
      <p className={styles.note}>
        <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
        {names[1] && (
          <>
            {" & "}
            <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
          </>
        )}
      </p>
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
