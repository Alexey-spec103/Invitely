"use client";

import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import EditablePhoto from "../EditablePhoto";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import StaggerReveal from "@/components/StaggerReveal";
import styles from "./MonogramCenter.module.css";

function getInitials(names: string[]): string {
  return names
    .map((name) => name.trim().charAt(0))
    .join("")
    .toUpperCase();
}

export default function MonogramCenter({
  names,
  eventDate,
  photoUrl,
  monogramInitials,
  styleOverrides,
}: HeroSectionVariantProps) {
  const initials = monogramInitials?.trim() || getInitials(names);
  const { editable } = useEditableField();

  return (
    <section className={styles.section}>
      {/* theme-photo-fallback QA report (2026-10-13): optional small round
          medallion above the monogram, when a host has a photo -- a single
          hairline ring, separate from the monogram itself (not wrapped
          around it) so the monogram keeps its own "no border chrome"
          editorial-typography look documented below. Omitted when no photo
          is set. */}
      {photoUrl && (
        <span className={styles.medallion}>
          <EditablePhoto src={photoUrl} className={styles.photo} alt={names.filter(Boolean).join(" & ")} />
        </span>
      )}
      {/* Auto-derived from names (or an explicit override) -- not itself an
          editable field; editing "names" below updates this for free. */}
      <div className={styles.monogram} aria-hidden="true">
        {initials}
      </div>
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
      {/* Not wrapped in EditableText: this is the real event date, used
          elsewhere for countdown/RSVP-deadline math -- free-text inline
          editing here could corrupt it. Editing stays on the Wedding Data
          form; this line just displays it. */}
      <p className={styles.date}>{eventDate}</p>
      <span className={styles.wreath} aria-hidden="true" />
    </section>
  );
}
