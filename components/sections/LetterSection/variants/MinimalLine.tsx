import type { LetterSectionVariantProps } from "../types";
import styles from "./MinimalLine.module.css";

function formatDeadline(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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
}: LetterSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.body}>{body}</p>
        {quote && <p className={styles.quote}>{quote}</p>}
        {note && <p className={styles.note}>{note}</p>}
        {rsvpDeadline && isDeadlineUpcoming(rsvpDeadline) && (
          <p className={styles.deadline}>Please confirm by {formatDeadline(rsvpDeadline)}</p>
        )}
        {closingLine && <p className={styles.closingLine}>{closingLine}</p>}
      </div>
    </section>
  );
}
