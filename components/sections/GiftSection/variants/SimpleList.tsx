"use client";

import type { GiftSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./SimpleList.module.css";

export default function SimpleList({ title, description, preferences, styleOverrides }: GiftSectionVariantProps) {
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      {(title || editable) && (
        <h2 className={styles.title}>
          <EditableText field="title" value={title ?? ""} style={styleOverrides?.["title"]} />
        </h2>
      )}
      {(description || editable) && (
        <p className={styles.description}>
          <EditableText field="description" value={description ?? ""} style={styleOverrides?.["description"]} />
        </p>
      )}

      {preferences.length > 0 && (
        <div className={styles.grid}>
          {preferences.map((item) => (
            <div key={item.id} className={styles.card}>
              <span className={styles.cardMark} aria-hidden="true" />
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.title} className={styles.image} />
              )}
              <p className={styles.cardTitle}>{item.title}</p>
              {item.description && <p className={styles.cardDescription}>{item.description}</p>}
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className={styles.cardLink}>
                  View
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
