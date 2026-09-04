"use client";

import type { GuestbookSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./MinimalList.module.css";

export default function MinimalList({ title, messages, styleOverrides }: GuestbookSectionVariantProps) {
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
        <div className={styles.list}>
          {messages.map((message, index) => (
            <div key={`${message.guestName}-${index}`} className={styles.row}>
              <p className={styles.comment}>{message.comment}</p>
              <p className={styles.author}>&mdash; {message.guestName}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
