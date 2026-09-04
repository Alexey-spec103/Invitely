import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./Letterpress.module.css";

/** Archival/letterpress: a double-ruled plate, deliberately monochrome
 * (names in text color, not accent) and all-caps -- reads as ink-on-paper
 * rather than a colorful modern invitation. */
export default function Letterpress({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.plate}>
        <span className={styles.stamp} aria-hidden="true" />
        <span className={styles.eyebrow}>Save the Date</span>
        <p className={styles.names}>
          <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
          {names[1] && (
            <>
              {" and "}
              <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
            </>
          )}
        </p>
        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.date}>{eventDate}</p>
      </div>
    </section>
  );
}
