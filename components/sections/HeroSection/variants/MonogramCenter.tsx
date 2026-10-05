"use client";

import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
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
  monogramInitials,
  styleOverrides,
}: HeroSectionVariantProps) {
  const initials = monogramInitials?.trim() || getInitials(names);
  const { editable } = useEditableField();

  return (
    <section className={styles.section}>
      {/* Auto-derived from names (or an explicit override) -- not itself an
          editable field; editing "names" below updates this for free. */}
      <div className={styles.monogram} aria-hidden="true">
        {initials}
      </div>
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
      {/* Not wrapped in EditableText: this is the real event date, used
          elsewhere for countdown/RSVP-deadline math -- free-text inline
          editing here could corrupt it. Editing stays on the Wedding Data
          form; this line just displays it. */}
      <p className={styles.date}>{eventDate}</p>
      <span className={styles.wreath} aria-hidden="true" />
    </section>
  );
}
