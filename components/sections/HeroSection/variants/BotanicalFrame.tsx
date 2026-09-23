import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { CORNER_PAIR_DECOR, CATEGORY_MASK_ACCENT } from "@/lib/themes/decorMotifs";
import styles from "./BotanicalFrame.module.css";

/** Botanical illustration/line-art: a decorative frame at all 4 corners
 * with text in the clear center -- no photo at all, unlike every other
 * variant that either omits imagery entirely or leans on a photo.
 *
 * A category with a real CORNER_PAIR_DECOR pair gets full-color Recraft
 * illustrations at all 4 corners (asset[0] at tl/br, asset[1] at tr/bl --
 * same alternating-diagonal convention as CenteredCard's own 2-corner use
 * of this pair, just doubled up since this frame has 4 corners not 2).
 * modern/minimal fall back to their own hand-authored mask accent instead
 * of the fully generic corner-flourish (same fallback CenteredCard uses). */
export default function BotanicalFrame({ names, eventDate, styleOverrides, themeCategory }: HeroSectionVariantProps) {
  const flourishAssets = themeCategory ? CORNER_PAIR_DECOR[themeCategory] : undefined;
  const maskAccent = !flourishAssets && themeCategory ? CATEGORY_MASK_ACCENT[themeCategory] : undefined;
  const maskAccentStyle = maskAccent
    ? { maskImage: `url(${maskAccent})`, WebkitMaskImage: `url(${maskAccent})` }
    : undefined;
  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        {flourishAssets ? (
          <>
            <img className={styles.flourishColorTl} src={flourishAssets[0]} alt="" aria-hidden="true" />
            <img className={styles.flourishColorTr} src={flourishAssets[1]} alt="" aria-hidden="true" />
            <img className={styles.flourishColorBl} src={flourishAssets[1]} alt="" aria-hidden="true" />
            <img className={styles.flourishColorBr} src={flourishAssets[0]} alt="" aria-hidden="true" />
          </>
        ) : (
          <>
            <span className={styles.flourish} data-pos="tl" style={maskAccentStyle} aria-hidden="true" />
            <span className={styles.flourish} data-pos="tr" style={maskAccentStyle} aria-hidden="true" />
            <span className={styles.flourish} data-pos="bl" style={maskAccentStyle} aria-hidden="true" />
            <span className={styles.flourish} data-pos="br" style={maskAccentStyle} aria-hidden="true" />
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
          <span className={styles.divider} aria-hidden="true" />
          <p className={styles.date}>{eventDate}</p>
        </div>
      </div>
    </section>
  );
}
