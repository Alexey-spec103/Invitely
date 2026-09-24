"use client";

import type { DressCodeSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./SwatchGrid.module.css";

/** No hex code, no name label under each chip -- flagged live: guests were
 * seeing the literal string "New color" printed under any swatch a host
 * added but hadn't gotten around to naming yet (DressCodeColorsManager
 * defaults a fresh swatch's label to exactly that string). The color itself
 * is the whole point of a dress-code swatch; a host can still type a label
 * in DressCodeColorsManager for their own reference, it just doesn't render
 * here. */
export default function SwatchGrid({ title, description, colors, styleOverrides }: DressCodeSectionVariantProps) {
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        <EditableText field="title" value={title} style={styleOverrides?.["title"]} />
      </h2>
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
