"use client";

import type { GuestbookSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./QuoteScroll.module.css";

export default function QuoteScroll({ title, messages, styleOverrides }: GuestbookSectionVariantProps) {
  const { editable } = useEditableField();
  if (messages.length === 0 && !editable) {
    return null;
  }

  return (
    <section className={styles.section}>
      {(title || editable) && (
        <h2 className={styles.title}>
          <EditableText field="title" value={title ?? ""} style={styleOverrides?.["title"]} />
        </h2>
      )}

      {messages.length === 0 ? (
        <p className={styles.empty}>Guests&apos; RSVP comments will appear here.</p>
      ) : (
        <div className={styles.track}>
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
