"use client";

import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import StaggerReveal from "@/components/StaggerReveal";
import EditablePhoto from "../EditablePhoto";
import styles from "./PhotoFullBleed.module.css";

// Same local derivation as MonogramCenter/MinimalText -- see those files'
// own comments for why this stays a small per-file copy.
function getInitials(names: string[]): string {
  return names
    .map((name) => name.trim().charAt(0))
    .filter(Boolean)
    .join("")
    .toUpperCase();
}

export default function PhotoFullBleed({
  names,
  eventDate,
  photoUrl,
  styleOverrides,
}: HeroSectionVariantProps) {
  const { editable } = useEditableField();
  if (!photoUrl) {
    const initials = getInitials(names);
    return (
      <section className={styles.sectionNoPhoto}>
        {/* No-photo fallback only -- the with-photo layout below already
            has its own quiet accent (.moon). Same oversized-ghost-initials
            treatment as MinimalText, which this layout's own CSS comment
            already names as its model. */}
        {initials && (
          <span className={styles.monogram} aria-hidden="true">
            {initials}
          </span>
        )}
        <div className={styles.contentCentered}>
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
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <EditablePhoto src={photoUrl} className={styles.photo} />
      <div className={styles.overlay} />
      <span className={styles.moon} aria-hidden="true" />
      <div className={styles.content}>
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
      </div>
    </section>
  );
}
