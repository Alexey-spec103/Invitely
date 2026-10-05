"use client";

import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import StaggerReveal from "@/components/StaggerReveal";
import EditablePhoto from "../EditablePhoto";
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
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      {photoUrl ? (
        <div className={styles.stage}>
          <EditablePhoto src={photoUrl} className={styles.photo} />
          <span className={styles.frame} aria-hidden="true" />
        </div>
      ) : (
        <span className={styles.archOutline} aria-hidden="true" />
      )}
      {editable ? (
        <p className={styles.names}>
          <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
          {names[1] && (
            <>
              {" & "}
              <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
            </>
          )}
        </p>
      ) : (
        <StaggerReveal as="p" itemAs="span" className={styles.names} staggerDelay={0.12}>
          <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
          {names[1] && <span>{" & "}</span>}
          {names[1] && <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />}
        </StaggerReveal>
      )}
      <p className={styles.date}>{eventDate}</p>
    </section>
  );
}
