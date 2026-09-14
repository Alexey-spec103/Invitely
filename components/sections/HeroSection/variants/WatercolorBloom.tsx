import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./WatercolorBloom.module.css";

/** Watercolor: a soft irregular blob shape (CSS-masked SVG, not a photo)
 * sits behind the text like a splash of paint -- the organic, imprecise
 * silhouette is the point, distinct from every hard-edged/geometric variant.
 * A second, much smaller sprig floats just off the blob's edge -- same
 * "no explicit inset, centered by the flex parent, nudged off-center with
 * transform" technique WatercolorBotanical's own CSS comment documents (an
 * explicit top/left offset here would fall outside the theme gallery's
 * text-centered crop, confirmed live for that sibling variant already). */
export default function WatercolorBloom({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.blob} aria-hidden="true" />
      <span className={styles.sprig} aria-hidden="true" />
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
    </section>
  );
}
