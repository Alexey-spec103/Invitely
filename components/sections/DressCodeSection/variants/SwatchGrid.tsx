"use client";

import type { DressCodeSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./SwatchGrid.module.css";

/** No hex code, no name label under each chip -- flagged live: guests were
 * seeing the literal string "New color" printed under any swatch a host
 * added but hadn't gotten around to naming yet (DressCodeColorsManager
 * defaults a fresh swatch's label to exactly that string). The color itself
 * is the whole point of a dress-code swatch; a host can still type a label
 * in DressCodeColorsManager for their own reference, it just doesn't render
 * here. */
export default function SwatchGrid({ title, description, colors, styleOverrides, locale }: DressCodeSectionVariantProps) {
  const { editable } = useEditableField();
  const t = getDictionary(locale).dressCode;
  return (
    <section className={styles.section}>
      <span className={styles.eyebrow}>{t.eyebrow}</span>
      {/* Accessibility audit (2026-10-22): title is seeded with a default
          the moment DressCode is enabled (see registry.tsx's
          DEFAULT_CONTENT_ON_ENABLE), but a host can still blank it via the
          "Editable blocks" hide/empty mechanism -- an unconditional heading
          would then ship an empty <h2></h2> to a guest (WCAG 2.4.6). Same
          fix as LetterSection/CenteredCard.tsx and MapSection/
          EmbedStatic.tsx. */}
      {(title || editable) && (
        <h2 className={styles.title}>
          <EditableText field="title" value={title} style={styleOverrides?.["title"]} />
        </h2>
      )}
      {(description || editable) && (
        <p className={styles.description}>
          <EditableText field="description" value={description ?? ""} style={styleOverrides?.["description"]} />
        </p>
      )}

      <div className={styles.grid}>
        <span className={styles.cornerTopLeft} aria-hidden="true" />
        <span className={styles.cornerBottomRight} aria-hidden="true" />
        {colors.map((color, index) => (
          <span
            key={`${color.hex}-${index}`}
            className={styles.chip}
            style={{ backgroundColor: color.hex }}
            title={color.label || undefined}
            aria-label={color.label || color.hex}
          />
        ))}
      </div>
    </section>
  );
}
