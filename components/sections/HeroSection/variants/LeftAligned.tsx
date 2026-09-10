import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./LeftAligned.module.css";

/** Minimal: names/date left-aligned in a tall column with generous negative
 * space on the right -- a real structural alternative (asymmetric) to
 * MinimalText's centered block, not a recolored copy of it. Otherwise
 * undecorated, matching the category's other variants (Editorial Minimal,
 * Minimal Text) -- minimal themes stay bare by design; the small accent
 * "&" between the stacked names is content, not decoration (dashboard-
 * audit.md C5: a bare line break here left two names sitting one above the
 * other with nothing marking them as a couple rather than one long name). */
export default function LeftAligned({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <p className={styles.names}>
          <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
          {names[1] && (
            <>
              <span className={styles.ampersand}>&amp;</span>
              <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
            </>
          )}
        </p>
        <p className={styles.date}>{eventDate}</p>
      </div>
    </section>
  );
}
