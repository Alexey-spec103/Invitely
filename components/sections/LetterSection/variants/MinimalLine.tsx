"use client";

import type { LetterSectionVariantProps } from "../types";
import type { Locale } from "@/lib/i18n/locales";
import { LOCALE_TO_BCP47 } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionary";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./MinimalLine.module.css";

function formatDeadline(isoDate: string, locale: Locale) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(LOCALE_TO_BCP47[locale], { year: "numeric", month: "long", day: "numeric" });
}

function isDeadlineUpcoming(isoDate: string): boolean {
  const deadline = new Date(`${isoDate}T23:59:59`);
  return deadline.getTime() >= Date.now();
}

export default function MinimalLine({
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
      <div className={styles.content}>
        <span className={styles.vine} aria-hidden="true" />
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
        {/* Always mounted (not `{quote && ...}`) so a host can still click in
            to write a first quote -- same dashboard-audit.md #4 fix already
            applied to CenteredCard; this variant has no decorative wrapper
            around the quote to worry about breaking when empty. */}
        <p className={styles.quote}>
          <EditableText
            field="quote"
            value={quote}
            style={styleOverrides?.["quote"]}
            placeholder="Add a quote (optional)…"
          />
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
    </section>
  );
}
