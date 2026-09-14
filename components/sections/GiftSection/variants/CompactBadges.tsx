"use client";

import type { GiftSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./CompactBadges.module.css";

export default function CompactBadges({ title, description, preferences, styleOverrides }: GiftSectionVariantProps) {
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
        <div className={styles.wrap}>
          {preferences.map((item) =>
            item.url ? (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={styles.badge}
              >
                <span className={styles.badgeIcon} aria-hidden="true" />
                {item.title}
              </a>
            ) : (
              <span key={item.id} className={styles.badge}>
                <span className={styles.badgeIcon} aria-hidden="true" />
                {item.title}
              </span>
            )
          )}
        </div>
      )}
    </section>
  );
}
