import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./HandLetteringHero.module.css";

/** Hand-lettering/calligraphy hero: the names in huge script are the whole
 * point of the composition -- everything else is small supporting type,
 * the reverse of every other variant where the heading font leads. */
export default function HandLetteringHero({ names, eventDate, photoUrl, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.moon} aria-hidden="true" />
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className={styles.photo} />
      )}
      <span className={styles.eyebrow}>We&apos;re getting married</span>
      <p className={styles.names}>
        <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
        {names[1] && (
          <>
            {" & "}
            <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
          </>
        )}
      </p>
      <span className={styles.swash} aria-hidden="true" />
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
