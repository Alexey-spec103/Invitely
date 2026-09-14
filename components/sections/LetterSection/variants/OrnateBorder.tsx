import type { LetterSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./OrnateBorder.module.css";

function formatDeadline(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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
}: LetterSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <span className={styles.flourish} data-pos="tl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="tr" aria-hidden="true" />
        <span className={styles.flourish} data-pos="bl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="br" aria-hidden="true" />
        <div className={styles.inner}>
          <h2 className={styles.title}>
            <EditableText field="title" value={title} style={styleOverrides?.["title"]} />
          </h2>
          <p className={styles.body}>
            <EditableText field="body" value={body} style={styleOverrides?.["body"]} />
          </p>
          {/* Always mounted, decorative quote marks conditional -- same
              dashboard-audit.md #4 fix already applied to CenteredCard, so a
              host can still click in to write a first quote from empty. */}
          <p className={styles.quote}>
            {quote && "“"}
            <EditableText field="quote" value={quote} style={styleOverrides?.["quote"]} />
            {quote && "”"}
          </p>
          {note && (
            <p className={styles.note}>
              <EditableText field="note" value={note} style={styleOverrides?.["note"]} />
            </p>
          )}
          {rsvpDeadline && isDeadlineUpcoming(rsvpDeadline) && (
            <p className={styles.deadline}>Please confirm by {formatDeadline(rsvpDeadline)}</p>
          )}
          {closingLine && (
            <p className={styles.closingLine}>
              <EditableText field="closingLine" value={closingLine} style={styleOverrides?.["closingLine"]} />
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
