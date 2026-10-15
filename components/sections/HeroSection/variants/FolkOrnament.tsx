"use client";

import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import EditablePhoto from "../EditablePhoto";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import StaggerReveal from "@/components/StaggerReveal";
import styles from "./FolkOrnament.module.css";

/** Folk/Slavic: repeating diamond-motif bands above and below the text,
 * evoking embroidery -- a distinct decorative language from the botanical/
 * geometric/organic motifs used by every other framed variant.
 *
 * theme-photo-fallback QA report (2026-10-13): optional round medallion
 * between the top embroidery band and the names, when a host has a photo
 * (same double-ring technique as BotanicalFrame). Omitted entirely when no
 * photo is set. */
export default function FolkOrnament({ names, eventDate, photoUrl, styleOverrides }: HeroSectionVariantProps) {
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      <span className={styles.band} aria-hidden="true" />
      <div className={styles.content}>
        {photoUrl && (
          <span className={styles.medallion}>
            <EditablePhoto src={photoUrl} className={styles.photo} alt={names.filter(Boolean).join(" & ")} />
          </span>
        )}
        {editable ? (
          <h1 className={styles.names}>
            <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
            {names[1] && (
              <>
                {" & "}
                <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
              </>
            )}
          </h1>
        ) : (
          <StaggerReveal as="h1" itemAs="span" className={styles.names} staggerDelay={0.12}>
            <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
            {names[1] && <span>{" & "}</span>}
            {names[1] && <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />}
          </StaggerReveal>
        )}
        <p className={styles.date}>{eventDate}</p>
      </div>
      <span className={styles.band} aria-hidden="true" />
    </section>
  );
}
