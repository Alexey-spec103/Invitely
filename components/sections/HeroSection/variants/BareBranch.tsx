import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./BareBranch.module.css";

/** Dark/Gothic: a quiet, almost-minimal composition -- the Dark category's
 * three existing variants (full-bleed photo, monogram-crest, art-deco-crest)
 * are all bold/ornamented, so this gives it a stark, atmospheric option too.
 * No photo slot -- the single dominant graphic is the branch silhouette, in
 * the same spirit as MinimalText/EditorialMinimal's "one quiet element"
 * restraint, just with a mood-appropriate accent instead of nothing. A
 * second, much quieter accent -- a thin diagonal stroke in the opposite
 * (top-left) corner -- balances the branch's weight on the right, so the
 * composition reads as two deliberate corners instead of one graphic and
 * a lot of empty space. */
export default function BareBranch({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.branch} aria-hidden="true" />
      <span className={styles.cornerStroke} aria-hidden="true" />
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
