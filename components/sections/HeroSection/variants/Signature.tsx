import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { CAP_DECOR, CATEGORY_MASK_ACCENT } from "@/lib/themes/decorMotifs";
import styles from "./Signature.module.css";

/** A single crowning sprig above the top rule -- same "cap" slot Countdown's
 * CircularRings and DressCode's ColorPalette already use CAP_DECOR for, just
 * in-flow here (a flex column) instead of absolutely positioned over a
 * wrapper, so it composes its own sizing rather than decorAnchors' capAbove
 * anchor (that anchor assumes position:absolute). */
export default function Signature({ names, eventDate, styleOverrides, themeCategory }: HeroSectionVariantProps) {
  const capAsset = themeCategory ? CAP_DECOR[themeCategory] : undefined;
  const maskAccent = !capAsset && themeCategory ? CATEGORY_MASK_ACCENT[themeCategory] : undefined;
  return (
    <section className={styles.section}>
      {capAsset ? (
        <img className={styles.sprigColor} src={capAsset} alt="" aria-hidden="true" />
      ) : (
        <span
          className={styles.sprig}
          style={maskAccent ? { maskImage: `url(${maskAccent})`, WebkitMaskImage: `url(${maskAccent})` } : undefined}
          aria-hidden="true"
        />
      )}
      <span className={styles.rule} aria-hidden="true" />
      <p className={styles.names}>
        <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
        {names[1] && (
          <>
            {" & "}
            <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
          </>
        )}
      </p>
      <span className={styles.rule} aria-hidden="true" />
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
