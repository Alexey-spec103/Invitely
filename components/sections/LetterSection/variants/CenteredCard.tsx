import type { LetterSectionVariantProps } from "../types";
import styles from "./CenteredCard.module.css";

function formatDeadline(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** A guest visiting after the stated deadline (very ordinary once RSVPs
 * have started coming in) shouldn't see a stale "please confirm by <past
 * date>" instruction -- once the day itself has passed, drop the line
 * rather than leave it looking broken. Server-rendered per request, so
 * comparing against `new Date()` here is safe (no client/server mismatch --
 * this component never re-renders client-side). */
function isDeadlineUpcoming(isoDate: string): boolean {
  const deadline = new Date(`${isoDate}T23:59:59`);
  return deadline.getTime() >= Date.now();
}

export default function CenteredCard({
  title,
  body,
  quote,
  note,
  rsvpDeadline,
  closingLine,
}: LetterSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <span className={styles.flourishTopLeft} aria-hidden="true" />
        <span className={styles.flourishBottomRight} aria-hidden="true" />
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.body}>{body}</p>
        <p className={styles.quote}>«{quote}»</p>
        {note && <p className={styles.note}>{note}</p>}
        {rsvpDeadline && isDeadlineUpcoming(rsvpDeadline) && (
          <p className={styles.deadline}>Please confirm by {formatDeadline(rsvpDeadline)}</p>
        )}
        {closingLine && <p className={styles.closingLine}>{closingLine}</p>}
      </div>
    </section>
  );
}
