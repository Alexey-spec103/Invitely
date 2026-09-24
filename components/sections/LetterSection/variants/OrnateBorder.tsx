"use client";

import type { LetterSectionVariantProps } from "../types";
import type { Locale } from "@/lib/i18n/locales";
import { LOCALE_TO_BCP47 } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionary";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./OrnateBorder.module.css";

function formatDeadline(isoDate: string, locale: Locale) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(LOCALE_TO_BCP47[locale], { year: "numeric", month: "long", day: "numeric" });
}

function isDeadlineUpcoming(isoDate: string): boolean {
  const deadline = new Date(`${isoDate}T23:59:59`);
  return deadline.getTime() >= Date.now();
}

export default function OrnateBorder({
  title,
  body,
  quote,
  note,
  rsvpDeadline,
  closingLine,
  styleOverrides,
  locale,
}: LetterSectionVariantProps) {
  const t = getDictionary(locale).letter;
  const { editable } = useEditableField();
  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <span className={styles.flourish} data-pos="tl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="tr" aria-hidden="true" />
        <span className={styles.flourish} data-pos="bl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="br" aria-hidden="true" />
        <div className={styles.inner}>
          <h2 className={styles.title}>
            <EditableText
              field="title"
              value={title}
              style={styleOverrides?.["title"]}
              placeholder="Write a title for your letter…"
            />
          </h2>
          <p className={styles.body}>
            <EditableText
              field="body"
              value={body}
              style={styleOverrides?.["body"]}
              placeholder="Write a welcome message to your guests…"
            />
          </p>
          {/* Always mounted, decorative quote marks conditional -- same
              dashboard-audit.md #4 fix already applied to CenteredCard, so a
              host can still click in to write a first quote from empty. */}
          <p className={styles.quote}>
            {quote && "“"}
            <EditableText
              field="quote"
              value={quote}
              style={styleOverrides?.["quote"]}
              placeholder="Add a quote (optional)…"
            />
            {quote && "”"}
          </p>
          {(note || editable) && (
            <p className={styles.note}>
              <EditableText
                field="note"
                value={note ?? ""}
                style={styleOverrides?.["note"]}
                placeholder="A short extra note (optional)…"
              />
            </p>
          )}
          {rsvpDeadline && isDeadlineUpcoming(rsvpDeadline) && (
            <p className={styles.deadline}>{t.confirmBy(formatDeadline(rsvpDeadline, locale))}</p>
          )}
          {(closingLine || editable) && (
            <p className={styles.closingLine}>
              <EditableText
                field="closingLine"
                value={closingLine ?? ""}
                style={styleOverrides?.["closingLine"]}
                placeholder="Sign off — e.g. “With love, the two of us”…"
              />
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
