"use client";

import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import EditablePhoto from "../EditablePhoto";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import StaggerReveal from "@/components/StaggerReveal";
import styles from "./BareBranch.module.css";

/** Dark/Gothic: a quiet, almost-minimal composition -- the Dark category's
 * three existing variants (full-bleed photo, monogram-crest, art-deco-crest)
 * are all bold/ornamented, so this gives it a stark, atmospheric option too.
 * No photo slot -- the single dominant graphic is the branch silhouette, in
 * the same spirit as MinimalText/EditorialMinimal's "one quiet element"
 * restraint, just with a mood-appropriate accent instead of nothing. A
 * second, much quieter accent -- a thin diagonal stroke in the opposite
 * (top-left) corner -- balances the branch's weight on the right, so the
 * composition reads as two deliberate corners instead of one graphic and
 * a lot of empty space.
 *
 * theme-photo-fallback QA report (2026-10-13): optional small round
 * medallion above the names, when a host has a photo -- a single hairline
 * ring, kept small and quiet to match this variant's own restrained,
 * atmospheric mood rather than becoming a third competing focal point. */
export default function BareBranch({ names, eventDate, photoUrl, styleOverrides }: HeroSectionVariantProps) {
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      <span className={styles.branch} aria-hidden="true" />
      <span className={styles.cornerStroke} aria-hidden="true" />
      <div className={styles.content}>
        {photoUrl && (
          <span className={styles.medallion}>
            <EditablePhoto src={photoUrl} className={styles.photo} alt={names.filter(Boolean).join(" & ")} />
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
      </div>
    </section>
  );
}
