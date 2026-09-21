import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { BOHO_ASYMMETRIC_VINE_DECOR, BOHO_ASYMMETRIC_CORNER_DECOR } from "@/lib/themes/decorMotifs";
import styles from "./BohoAsymmetric.module.css";

/** Boho: deliberately off-center -- content anchored bottom-left, a
 * full-height vine framing the right edge instead of a symmetric frame
 * or centered composition. The asymmetry itself is the archetype.
 *
 * The vine (not a small corner icon) is a deliberate density call: per
 * user feedback that one small element per section read as too sparse next
 * to weddingpost.ru's own invitations (e.g. the "Андрей и Анна" mockup,
 * where a wisteria vine runs the full viewport height framing the whole
 * hero) -- see LOG.md Reference 4. `boho-color-vine-tall.svg` is a 1:2
 * portrait composition; `object-fit: cover` center-crops it horizontally
 * to fit the narrow strip while preserving its full vertical span, so the
 * cropped frond tips read as an intentional edge-bleed rather than an
 * accident.
 *
 * This variant is *shared* across three categories in
 * recommendedHeroVariant.ts (boho, botanical, rustic) -- it only knows CSS
 * custom properties by default, so the same component works for any theme's
 * colors. The full-color illustrated vine/corner pair below has a fixed
 * category-specific palette baked in (unlike a theme-accent-tinted mask),
 * which clashes on e.g. a sage-green botanical theme -- so it's gated per
 * category and falls back to the original accent-tinted single-color masks
 * (safe for any category, still used by botanical) otherwise. Rustic has no
 * full-height vine asset yet (only corner-style motifs), so it reuses the
 * original two-corner layout instead of boho's full-edge vine. This
 * variant is bottom-anchored for the theme gallery crop (unlike
 * Watercolor*'s centered variants), so hard corner offsets are safe here --
 * confirmed by the existing masked fallback already using them. */
export default function BohoAsymmetric({ names, eventDate, styleOverrides, themeCategory }: HeroSectionVariantProps) {
  const vineAsset = themeCategory ? BOHO_ASYMMETRIC_VINE_DECOR[themeCategory] : undefined;
  const cornerAssets = themeCategory ? BOHO_ASYMMETRIC_CORNER_DECOR[themeCategory] : undefined;
  return (
    <section className={styles.section}>
      {vineAsset ? (
        <img className={styles.sideVine} src={vineAsset} alt="" aria-hidden="true" />
      ) : cornerAssets ? (
        <>
          <img className={styles.rusticSprig} src={cornerAssets[0]} alt="" aria-hidden="true" />
          <img className={styles.rusticCornerSprig} src={cornerAssets[1]} alt="" aria-hidden="true" />
        </>
      ) : (
        <>
          <span className={styles.sprigMask} aria-hidden="true" />
          <span className={styles.cornerSprigMask} aria-hidden="true" />
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
