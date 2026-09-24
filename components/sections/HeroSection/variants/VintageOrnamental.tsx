import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import EditablePhoto from "../EditablePhoto";
import { CORNER_PAIR_DECOR, CATEGORY_MASK_ACCENT } from "@/lib/themes/decorMotifs";
import styles from "./VintageOrnamental.module.css";

/** Vintage/Regency: a double-ruled frame *combined* with corner flourishes
 * (BotanicalFrame and Letterpress each use only one of these devices) --
 * the busier, more ornate combination reads as antique stationery.
 *
 * Same full-color-at-4-corners treatment as BotanicalFrame -- see that
 * sibling's comment for the asset-pairing and modern/minimal fallback. */
export default function VintageOrnamental({
  names,
  eventDate,
  photoUrl,
  styleOverrides,
  themeCategory,
}: HeroSectionVariantProps) {
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
        <div className={styles.inner}>
          {photoUrl && <EditablePhoto src={photoUrl} className={styles.photo} />}
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
      </div>
    </section>
  );
}
