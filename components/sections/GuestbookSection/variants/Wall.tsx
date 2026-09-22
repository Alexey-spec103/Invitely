"use client";

import type { GuestbookSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./Wall.module.css";

export default function Wall({ title, messages, styleOverrides, locale }: GuestbookSectionVariantProps) {
  const { editable } = useEditableField();
  const t = getDictionary(locale).guestbook;
  if (messages.length === 0 && !editable) {
    return null;
  }

  return (
    <section className={styles.section}>
      <span className={styles.quoteMark} aria-hidden="true">
        &ldquo;
      </span>
      {(title || editable) && (
        <h2 className={styles.title}>
          <EditableText field="title" value={title ?? ""} style={styleOverrides?.["title"]} />
        </h2>
      )}

      {messages.length === 0 ? (
        <p className={styles.empty}>{t.empty}</p>
      ) : (
        <div className={styles.grid}>
          {messages.map((message, index) => (
            <div key={`${message.guestName}-${index}`} className={styles.card}>
              <p className={styles.comment}>&ldquo;{message.comment}&rdquo;</p>
              <p className={styles.author}>{message.guestName}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
