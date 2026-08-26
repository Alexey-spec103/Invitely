import type { LetterSectionVariantProps } from "../types";
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
}: LetterSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <span className={styles.flourish} data-pos="tl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="tr" aria-hidden="true" />
        <span className={styles.flourish} data-pos="bl" aria-hidden="true" />
        <span className={styles.flourish} data-pos="br" aria-hidden="true" />
        <div className={styles.inner}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.body}>{body}</p>
          {quote && <p className={styles.quote}>&ldquo;{quote}&rdquo;</p>}
          {note && <p className={styles.note}>{note}</p>}
          {rsvpDeadline && isDeadlineUpcoming(rsvpDeadline) && (
            <p className={styles.deadline}>Please confirm by {formatDeadline(rsvpDeadline)}</p>
          )}
          {closingLine && <p className={styles.closingLine}>{closingLine}</p>}
        </div>
      </div>
    </section>
  );
}
