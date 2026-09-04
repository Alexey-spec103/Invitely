import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./BotanicalFrame.module.css";

/** Botanical illustration/line-art: a decorative frame at all 4 corners
 * with text in the clear center -- no photo at all, unlike every other
 * variant that either omits imagery entirely or leans on a photo. */
export default function BotanicalFrame({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <span className={styles.flourish} data-pos="tl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="tr" aria-hidden="true" />
        <span className={styles.flourish} data-pos="bl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="br" aria-hidden="true" />
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
