"use client";

import type { FaqSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { CORNER_PAIR_DECOR } from "@/lib/themes/decorMotifs";
import styles from "./SimpleList.module.css";

/** A plain, legible question-and-answer list -- not an accordion. No
 * collapse/expand interaction exists anywhere else in this codebase's
 * section variants (checked RSVP/Gift/Guestbook before adding one here), so
 * a new disclosure pattern would be the only one of its kind rather than
 * reusing an established interaction. A handful of short answers reads fine
 * fully open; this can grow an accordion variant later if a host's FAQ gets
 * long enough to want one. */
export default function SimpleList({ title, items, styleOverrides, themeCategory }: FaqSectionVariantProps) {
  const { editable } = useEditableField();
  const accentAssets = themeCategory ? CORNER_PAIR_DECOR[themeCategory] : undefined;
  return (
    <section className={accentAssets ? `${styles.section} ${styles.sectionColor}` : styles.section}>
      {accentAssets && (
        <>
          <img className={styles.accentTopLeft} src={accentAssets[0]} alt="" aria-hidden="true" />
          <img className={styles.accentBottomRight} src={accentAssets[1]} alt="" aria-hidden="true" />
        </>
      )}
      {(title || editable) && (
        <h2 className={styles.title}>
          <EditableText field="title" value={title ?? ""} style={styleOverrides?.["title"]} />
        </h2>
      )}
      {items.length > 0 && (
        <dl className={styles.list}>
          {items.map((item, index) => (
            <div key={index} className={styles.item}>
              <dt className={styles.question}>
                <EditableText
                  field={`items.${index}.question`}
                  value={item.question}
                  style={styleOverrides?.[`items.${index}.question`]}
                  placeholder="Question"
                />
              </dt>
              <dd className={styles.answer}>
                <EditableText
                  field={`items.${index}.answer`}
                  value={item.answer}
                  style={styleOverrides?.[`items.${index}.answer`]}
                  placeholder="Answer"
                />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
