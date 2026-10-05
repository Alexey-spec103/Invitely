"use client";

import type { HeroSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import StaggerReveal from "@/components/StaggerReveal";
import styles from "./AlcoholInkGold.module.css";

/** dashboard-audit.md C8: alcohol ink with gold -- a technique defined by
 * blended color "blooms" with metallic gold veining traced through them,
 * genuinely different from every other decorative variant here (all of
 * which are a single-tone SVG silhouette). The color field is CSS
 * gradients blended from the theme's own bg/accent/text (color-mix), so it
 * stays theme-coherent instead of introducing an unrelated fixed palette;
 * the veining is masked in a fixed gold, not the theme's accent color --
 * same reasoning PhotoFullBleed fixes its text color: gold is the whole
 * point of the technique, so a theme can't recolor it away. */
export default function AlcoholInkGold({ names, eventDate, styleOverrides }: HeroSectionVariantProps) {
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      <span className={styles.veins} aria-hidden="true" />
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
