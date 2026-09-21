import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { WATERCOLOR_BLOOM_DECOR, WATERCOLOR_BLOOM_RING } from "@/lib/themes/decorMotifs";
import styles from "./WatercolorBloom.module.css";

/** Watercolor: a soft irregular blob shape (CSS-masked SVG, not a photo)
 * sits behind the text like a splash of paint -- the organic, imprecise
 * silhouette is the point, distinct from every hard-edged/geometric variant.
 * A second, much smaller sprig floats just off the blob's edge -- same
 * "no explicit inset, centered by the flex parent, nudged off-center with
 * transform" technique WatercolorBotanical's own CSS comment documents (an
 * explicit top/left offset here would fall outside the theme gallery's
 * text-centered crop, confirmed live for that sibling variant already).
 *
 * Shared by `romantic`, `boho`, `coastal`, `dark`, and `vintage` in
 * recommendedHeroVariant.ts -- the full-color illustrated pair below has a
 * category-specific fixed palette, so it's gated per category and falls
 * back to the original theme-accent-tinted masks (safe for any category)
 * otherwise.
 *
 * Only romantic's rose wreath is a genuine open-center ring, so only it
 * uses the centered `.blobColor` position text can nest inside (see
 * WATERCOLOR_BLOOM_RING in decorMotifs.ts) -- every other category's
 * asset is a solid spray/branch/scroll cluster with no open middle, and
 * gets `.blobColorCorner`'s off-center placement instead. Confirmed live,
 * twice, that centering a solid-cluster asset the same way as the wreath
 * runs the artwork directly through the names. */
export default function WatercolorBloom({ names, eventDate, styleOverrides, themeCategory }: HeroSectionVariantProps) {
  const decor = themeCategory ? WATERCOLOR_BLOOM_DECOR[themeCategory] : undefined;
  const isRing = themeCategory ? !!WATERCOLOR_BLOOM_RING[themeCategory] : false;
  return (
    <section className={styles.section}>
      {decor ? (
        <>
          <img
            className={isRing ? styles.blobColor : styles.blobColorCorner}
            src={decor[0]}
            alt=""
            aria-hidden="true"
          />
          <img
            className={isRing ? styles.sprigColor : styles.sprigColorCorner}
            src={decor[1]}
            alt=""
            aria-hidden="true"
          />
        </>
      ) : (
        <>
          <span className={styles.blob} aria-hidden="true" />
          <span className={styles.sprig} aria-hidden="true" />
        </>
      )}
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
