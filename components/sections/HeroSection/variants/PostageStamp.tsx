import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./PostageStamp.module.css";

/** Vintage: a photo framed like an antique postage stamp -- thick paper
 * margin, a dashed perforated edge, and a small etched "postmark" accent
 * (the same asset Letterpress uses for its own stamp motif) in the corner.
 * Structurally distinct from VintageOrnamental's boxed double-frame and
 * BotanicalFrame's corner-only viney flourishes. Honest fallback: no photo
 * means no stamp card at all, not an empty perforated rectangle. */
export default function PostageStamp({ names, eventDate, photoUrl, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      {photoUrl && (
        <div className={styles.stamp}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="" className={styles.photo} />
          <span className={styles.postmark} aria-hidden="true" />
        </div>
      )}
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
    </section>
  );
}
