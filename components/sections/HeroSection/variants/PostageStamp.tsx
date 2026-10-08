"use client";

import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import StaggerReveal from "@/components/StaggerReveal";
import EditablePhoto from "../EditablePhoto";
import styles from "./PostageStamp.module.css";

/** Vintage: a photo framed like an antique postage stamp -- thick paper
 * margin, a dashed perforated edge, and a small etched "postmark" accent
 * (the same asset Letterpress uses for its own stamp motif) in the corner.
 * Structurally distinct from VintageOrnamental's boxed double-frame and
 * BotanicalFrame's corner-only viney flourishes. Honest fallback: no photo
 * means no stamp card WITH A PHOTO SLOT (that would read as a broken empty
 * image well) -- but the same dashed-perforation + postmark motif, without
 * a photo well, stands in as a small quiet "blank stamp" corner accent so
 * the section still reads as this variant's own composition. */
export default function PostageStamp({ names, eventDate, photoUrl, styleOverrides }: HeroSectionVariantProps) {
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      {photoUrl ? (
        <div className={styles.stamp}>
          <EditablePhoto src={photoUrl} className={styles.photo} alt={names.filter(Boolean).join(" & ")} />
          <span className={styles.postmark} aria-hidden="true" />
        </div>
      ) : (
        <span className={styles.blankStamp} aria-hidden="true">
          <span className={styles.postmark} aria-hidden="true" />
        </span>
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
