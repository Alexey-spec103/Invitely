"use client";

import type { LetterSectionVariantProps } from "../types";
import type { Locale } from "@/lib/i18n/locales";
import { LOCALE_TO_BCP47 } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionary";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import StaggerReveal from "@/components/StaggerReveal";
import styles from "./SplitQuote.module.css";

function formatDeadline(isoDate: string, locale: Locale) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(LOCALE_TO_BCP47[locale], { year: "numeric", month: "long", day: "numeric" });
}

function isDeadlineUpcoming(isoDate: string): boolean {
  const deadline = new Date(`${isoDate}T23:59:59`);
  return deadline.getTime() >= Date.now();
}

export default function SplitQuote({
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
  // Two independent field groups, not one shared array -- .text and
  // .quotePanel are separate grid-cell containers (a single StaggerReveal
  // wrapper can't span both without breaking the two-column grid), so each
  // gets its own array/StaggerReveal, same array-then-wrap approach as
  // CenteredCard applied per column.
  const textFields = [
    <h2 key="title" className={styles.title}>
      <EditableText
        field="title"
        value={title}
        style={styleOverrides?.["title"]}
        placeholder="Write a title for your letter…"
      />
    </h2>,
    <p key="body" className={styles.body}>
      <EditableText
        field="body"
        value={body}
        style={styleOverrides?.["body"]}
        placeholder="Write a welcome message to your guests…"
      />
    </p>,
    (note || editable) && (
      <p key="note" className={styles.note}>
        <EditableText
          field="note"
          value={note ?? ""}
          style={styleOverrides?.["note"]}
          placeholder="A short extra note (optional)…"
        />
      </p>
    ),
    rsvpDeadline && isDeadlineUpcoming(rsvpDeadline) && (
      <p key="deadline" className={styles.deadline}>
        {t.confirmBy(formatDeadline(rsvpDeadline, locale))}
      </p>
    ),
    (closingLine || editable) && (
      <p key="closingLine" className={styles.closingLine}>
        <EditableText
          field="closingLine"
          value={closingLine ?? ""}
          style={styleOverrides?.["closingLine"]}
          placeholder="Sign off — e.g. “With love, the two of us”…"
        />
      </p>
    ),
  ];
  const quoteField = (
    <p key="quote" className={styles.quote}>
      <EditableText
        field="quote"
        value={quote}
        style={styleOverrides?.["quote"]}
        placeholder="Add a quote (optional)…"
      />
    </p>
  );
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.text}>
          {editable ? textFields : <StaggerReveal staggerDelay={0.1}>{textFields}</StaggerReveal>}
        </div>
        {/* The panel itself stays mounted (not `{quote && ...}`) so a host
            can still click in to write a first quote from empty -- same
            dashboard-audit.md #4 fix already applied to CenteredCard. Only
            the decorative quote mark is conditional. */}
        <div className={styles.quotePanel}>
          <span className={styles.panelMark} aria-hidden="true" />
          {quote && (
            <span className={styles.quoteMark} aria-hidden="true">
              &ldquo;
            </span>
          )}
          {editable ? quoteField : <StaggerReveal staggerDelay={0.1}>{quoteField}</StaggerReveal>}
        </div>
      </div>
    </section>
  );
}
