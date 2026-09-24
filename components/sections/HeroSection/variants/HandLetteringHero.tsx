import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import EditablePhoto from "../EditablePhoto";
import { CAP_DECOR } from "@/lib/themes/decorMotifs";
import styles from "./HandLetteringHero.module.css";

/** Hand-lettering/calligraphy hero: the names in huge script are the whole
 * point of the composition -- everything else is small supporting type,
 * the reverse of every other variant where the heading font leads.
 *
 * Only .moon gets a full-color swap (via CAP_DECOR) -- .swash stays the
 * plain accent-tinted mask always, since it's a calligraphic pen flourish
 * under the script, not a botanical/illustrated motif; a colorful floral
 * asset there would fight the "hand-lettered underline" it's meant to read
 * as. */
export default function HandLetteringHero({
  names,
  eventDate,
  photoUrl,
  styleOverrides,
  eyebrow,
  themeCategory,
}: HeroSectionVariantProps) {
  const capAsset = themeCategory ? CAP_DECOR[themeCategory] : undefined;
  return (
    <section className={styles.section}>
      {capAsset ? (
        <img className={styles.moonColor} src={capAsset} alt="" aria-hidden="true" />
      ) : (
        <span className={styles.moon} aria-hidden="true" />
      )}
      {photoUrl && <EditablePhoto src={photoUrl} className={styles.photo} />}
      <span className={styles.eyebrow}>
        <EditableText field="eyebrow" value={eyebrow || "We're getting married"} style={styleOverrides?.["eyebrow"]} />
      </span>
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
