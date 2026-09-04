import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./CoastalWave.module.css";

/** Coastal/Mediterranean: content sits in a wide, airy upper zone; a
 * horizon-line wave band anchors the bottom of the viewport -- the only
 * variant with a distinct horizontal "sky over sea" zoning. */
export default function CoastalWave({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <span className={styles.shell} aria-hidden="true" />
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
      <div className={styles.horizon} aria-hidden="true" />
    </section>
  );
}
