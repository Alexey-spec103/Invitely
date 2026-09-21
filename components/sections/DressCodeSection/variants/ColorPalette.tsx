"use client";

import type { DressCodeSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { CAP_DECOR } from "@/lib/themes/decorMotifs";
import styles from "./ColorPalette.module.css";

export default function ColorPalette({ title, description, colors, styleOverrides, themeCategory }: DressCodeSectionVariantProps) {
  const { editable } = useEditableField();
  const capAsset = themeCategory ? CAP_DECOR[themeCategory] : undefined;
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

      <div className={capAsset ? `${styles.swatchesWrap} ${styles.swatchesWrapColor}` : styles.swatchesWrap}>
        {capAsset ? (
          <img className={styles.laurelCapColor} src={capAsset} alt="" aria-hidden="true" />
        ) : (
          <span className={styles.laurelCap} aria-hidden="true" />
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
      </div>
    </section>
  );
}
