"use client";

import type { DressCodeSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./ColorPalette.module.css";

export default function ColorPalette({ title, description, colors, styleOverrides }: DressCodeSectionVariantProps) {
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

      <div className={styles.swatches}>
        {colors.map((color, index) => (
          <div key={`${color.hex}-${index}`} className={styles.swatch}>
            <span className={styles.chip} style={{ backgroundColor: color.hex }} aria-hidden="true" />
            {(color.label || editable) && (
              <span className={styles.label}>
                <EditableText
                  field={`colors.${index}.label`}
                  value={color.label ?? ""}
                  style={styleOverrides?.[`colors.${index}.label`]}
                />
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
