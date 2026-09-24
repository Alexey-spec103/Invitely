"use client";

import type { TimelineSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./AlternatingSides.module.css";

export default function AlternatingSides({ title, events, styleOverrides }: TimelineSectionVariantProps) {
  // Same reasoning as LetterSection's note/closingLine: stays mounted while
  // editable so a host has something to click to write a first "Details"
  // line, public site keeps the original text-only-if-present behavior.
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        <EditableText field="title" value={title} style={styleOverrides?.["title"]} />
      </h2>
      <ol className={styles.list}>
        {events.map((event, index) => (
          <li key={index} className={styles.item}>
            <span className={styles.dot} aria-hidden="true" />
            <div className={styles.content}>
              <span className={styles.time}>
                <EditableText field={`events.${index}.time`} value={event.time} style={styleOverrides?.[`events.${index}.time`]} />
              </span>
              <span className={styles.eventTitle}>
                <EditableText field={`events.${index}.title`} value={event.title} style={styleOverrides?.[`events.${index}.title`]} />
              </span>
              {(event.description || editable) && (
                <span className={styles.description}>
                  <EditableText
                    field={`events.${index}.description`}
                    value={event.description ?? ""}
                    style={styleOverrides?.[`events.${index}.description`]}
                    placeholder="Add details (optional)…"
                  />
                </span>
              )}
            </div>
            <div className={styles.spacer} aria-hidden="true">
              <span className={styles.spacerMark} aria-hidden="true" />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
