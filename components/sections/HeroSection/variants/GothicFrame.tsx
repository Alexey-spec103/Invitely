import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./GothicFrame.module.css";

/** Dark/Gothic: a pointed-arch ornamental frame (a distinct silhouette from
 * EditorialSplit's plain rounded arch) wraps a portrait photo -- gives the
 * Dark category a genuine framed-photo option alongside the existing
 * full-bleed/monogram-crest/art-deco-crest variants, none of which frame a
 * photo this way. Honest fallback: with no photo, neither the photo nor the
 * ornamented .frame mask renders (a hollow frame ring with nothing inside
 * would read as broken, not intentional) -- but a plain empty arch outline,
 * pure CSS border-radius, no photo/mask required, now stands in its place
 * so the section is never just two lines of text on a blank field. */
export default function GothicFrame({ names, eventDate, photoUrl, styleOverrides }: HeroSectionVariantProps) {
  return (
    <section className={styles.section}>
      {photoUrl ? (
        <div className={styles.stage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="" className={styles.photo} />
          <span className={styles.frame} aria-hidden="true" />
        </div>
      ) : (
        <span className={styles.archOutline} aria-hidden="true" />
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
