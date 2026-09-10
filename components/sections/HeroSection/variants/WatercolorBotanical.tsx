import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./WatercolorBotanical.module.css";

/** dashboard-audit.md C8: "watercolor botanical" -- a distinct technique
 * from WatercolorBloom's abstract paint-splash silhouette (which stays
 * exactly as-is; this is a new sibling, not a rewrite of it). Same soft
 * CSS-masked-SVG approach, but the shape is a real arching floral branch
 * (leaves + a couple of loose blooms) rather than an imprecise blob, so the
 * "botanical" half of the name is actually true of what renders. */
export default function WatercolorBotanical({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <span className={styles.branch} aria-hidden="true" />
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
