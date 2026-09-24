"use client";

import type { DressCodeSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./MinimalStripe.module.css";

export default function MinimalStripe({ title, description, colors, styleOverrides }: DressCodeSectionVariantProps) {
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

      <div className={styles.stripeWrap}>
        <span className={styles.stripeCapLeft} aria-hidden="true" />
        <span className={styles.stripeCapRight} aria-hidden="true" />
        <div
          className={styles.stripe}
          role="img"
          aria-label={colors.map((color) => color.label || color.hex).join(", ")}
        >
          {colors.map((color, index) => (
            <span
              key={`${color.hex}-${index}`}
              className={styles.band}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
