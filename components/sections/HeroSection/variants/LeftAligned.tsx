"use client";

import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import EditablePhoto from "../EditablePhoto";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import StaggerReveal from "@/components/StaggerReveal";
import styles from "./LeftAligned.module.css";

/** Minimal: names/date left-aligned in a tall column with generous negative
 * space on the right -- a real structural alternative (asymmetric) to
 * MinimalText's centered block, not a recolored copy of it. The small
 * accent "&" between the stacked names is content, not decoration
 * (dashboard-audit.md C5: a bare line break here left two names sitting one
 * above the other with nothing marking them as a couple rather than one
 * long name). One quiet open corner bracket now fills the empty right side
 * -- same plain-CSS-border technique as StackedGrid's own corners (its
 * sibling "bare by design" minimal variant), so the two read as a
 * consistent pair rather than one fixed and one left alone.
 *
 * theme-photo-fallback QA report (2026-10-13): when a host has a photo, a
 * portrait panel fills that same generous right-side negative space instead
 * of sitting empty behind the corner bracket -- the bracket stays, now
 * framing the photo's corner rather than open air. No photo: unchanged. */
export default function LeftAligned({ names, eventDate, photoUrl, styleOverrides }: HeroSectionVariantProps) {
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      {photoUrl && (
        <span className={styles.photoPanel}>
          <EditablePhoto src={photoUrl} className={styles.photo} alt={names.filter(Boolean).join(" & ")} />
        </span>
      )}
      <span className={styles.corner} aria-hidden="true" />
      <div className={styles.content}>
        {editable ? (
          <p className={styles.names}>
            <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
            {names[1] && (
              <>
                <span className={styles.ampersand}>&amp;</span>
                <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />
              </>
            )}
          </p>
        ) : (
          <StaggerReveal as="p" itemAs="span" className={styles.names} staggerDelay={0.12}>
            <EditableText field="names.0" value={names[0] ?? ""} style={styleOverrides?.["names.0"]} />
            {names[1] && <span className={styles.ampersand}>&amp;</span>}
            {names[1] && <EditableText field="names.1" value={names[1]} style={styleOverrides?.["names.1"]} />}
          </StaggerReveal>
        )}
        <p className={styles.date}>{eventDate}</p>
      </div>
    </section>
  );
}
