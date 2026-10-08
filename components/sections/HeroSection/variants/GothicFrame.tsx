"use client";

import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import StaggerReveal from "@/components/StaggerReveal";
import EditablePhoto from "../EditablePhoto";
import styles from "./GothicFrame.module.css";

/** Dark/Gothic: a rounded-arch portrait photo, same silhouette as the
 * no-photo .archOutline fallback below (pure CSS border-radius, both
 * states share one shape language instead of two unrelated ones). Used to
 * overlay an ornamental SVG ring (`/patterns/dark-gothic-frame.svg`) on top
 * of the photo via a CSS mask -- removed after it turned out to be a
 * mismatched asset: that SVG is a roughly-square decorative oval wreath
 * with its own top rule and corner flourishes (meant for a full border
 * treatment), not a tight pointed-arch photo mask, so scaling it onto a
 * portrait photo box put vine scrollwork directly across the sitter's face
 * (confirmed live, reported by a real upload, not a template mockup). A
 * thin accent-colored border now does the "framed" job reliably instead. */
export default function GothicFrame({ names, eventDate, photoUrl, styleOverrides }: HeroSectionVariantProps) {
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      {photoUrl ? (
        <div className={styles.stage}>
          <EditablePhoto src={photoUrl} className={styles.photo} alt={names.filter(Boolean).join(" & ")} />
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
