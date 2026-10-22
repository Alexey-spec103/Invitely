"use client";

import type { TimelineSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./HorizontalScroll.module.css";

export default function HorizontalScroll({ title, events, styleOverrides }: TimelineSectionVariantProps) {
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      {/* Accessibility audit (2026-10-22): an unconditional heading here
          ships an empty <h2></h2> to a guest when a host leaves this title
          blank -- a screen reader announces "heading level 2, blank"
          (WCAG 2.4.6). Same fix as LetterSection/CenteredCard.tsx and
          MapSection/EmbedStatic.tsx. */}
      {(title || editable) && (
        <h2 className={styles.title}>
          <EditableText field="title" value={title} style={styleOverrides?.["title"]} />
        </h2>
      )}
      <div className={styles.track}>
        {events.map((event, index) => (
          <div key={index} className={styles.card}>
            <span className={styles.cardMark} aria-hidden="true" />
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
        ))}
      </div>
    </section>
  );
}
