import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./BohoAsymmetric.module.css";

/** Boho: deliberately off-center -- content anchored bottom-left, a
 * cluster of leaf motifs floating top-right instead of a symmetric frame
 * or centered composition. The asymmetry itself is the archetype. A second,
 * much smaller sprig sits in the one corner still empty (bottom-right) --
 * a different real asset (lavender, not pampas grass) so the two accents
 * read as a considered pair rather than one shape doubled. This variant is
 * bottom-anchored for the theme gallery crop (unlike Watercolor*'s centered
 * variants), so hard corner offsets are safe here -- confirmed by the
 * existing .sprig already using them. */
export default function BohoAsymmetric({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.sprig} aria-hidden="true" />
      <span className={styles.cornerSprig} aria-hidden="true" />
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
