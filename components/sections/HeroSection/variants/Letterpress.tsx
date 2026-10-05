"use client";

import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import StaggerReveal from "@/components/StaggerReveal";
import styles from "./Letterpress.module.css";

/** Archival/letterpress: a double-ruled plate, deliberately monochrome
 * (names in text color, not accent) and all-caps -- reads as ink-on-paper
 * rather than a colorful modern invitation. */
export default function Letterpress({ names, eventDate, styleOverrides, eyebrow }: HeroSectionVariantProps) {
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      <div className={styles.plate}>
        <span className={styles.stamp} aria-hidden="true" />
        <span className={styles.eyebrow}>
          <EditableText field="eyebrow" value={eyebrow || "Save the Date"} style={styleOverrides?.["eyebrow"]} />
        </span>
        {editable ? (
          <p className={styles.names}>
            <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
            {names[1] && (
              <>
                {" and "}
                <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
              </>
            )}
          </p>
        ) : (
          <StaggerReveal as="p" itemAs="span" className={styles.names} staggerDelay={0.12}>
            <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
            {names[1] && <span>{" and "}</span>}
            {names[1] && <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />}
          </StaggerReveal>
        )}
        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.date}>{eventDate}</p>
      </div>
    </section>
  );
}
