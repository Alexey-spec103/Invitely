"use client";

import type { GiftSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./MinimalRows.module.css";

export default function MinimalRows({ title, description, preferences, styleOverrides, locale }: GiftSectionVariantProps) {
  const { editable } = useEditableField();
  const t = getDictionary(locale).gift;
  return (
    <section className={styles.section}>
      {(title || editable) && (
        <div className={styles.titleRow}>
          <span className={styles.titleFlourish} aria-hidden="true" />
          <h2 className={styles.title}>
            <EditableText field="title" value={title ?? ""} style={styleOverrides?.["title"]} />
          </h2>
          <span className={`${styles.titleFlourish} ${styles.titleFlourishRight}`} aria-hidden="true" />
        </div>
      )}
      {(description || editable) && (
        <p className={styles.description}>
          <EditableText field="description" value={description ?? ""} style={styleOverrides?.["description"]} />
        </p>
      )}

      {preferences.length > 0 && (
        <div className={styles.list}>
          {preferences.map((item) => (
            <div key={item.id} className={styles.row}>
              <div className={styles.rowText}>
                <p className={styles.rowTitle}>{item.title}</p>
                {item.description && <p className={styles.rowDescription}>{item.description}</p>}
              </div>
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className={styles.rowLink}>
                  {t.viewLink}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
