"use client";

import type { TimelineSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./VerticalLine.module.css";

export default function VerticalLine({ title, events, styleOverrides }: TimelineSectionVariantProps) {
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        <EditableText field="title" value={title} style={styleOverrides?.["title"]} />
      </h2>
      <div className={styles.listWrap}>
        <span className={styles.spineCap} aria-hidden="true" />
        <ol className={styles.list}>
          {events.map((event, index) => (
            <li key={index} className={styles.item}>
              <span className={styles.dot} aria-hidden="true" />
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
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
