import type { LetterSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
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
  styleOverrides,
}: LetterSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <span className={styles.flourishTopLeft} aria-hidden="true" />
        <span className={styles.flourishBottomRight} aria-hidden="true" />
        <h2 className={styles.title}>
          <EditableText field="title" value={title} style={styleOverrides?.["title"]} />
        </h2>
        <p className={styles.body}>
          <EditableText field="body" value={body} style={styleOverrides?.["body"]} />
        </p>
        <p className={styles.quote}>
          {/* dashboard-audit.md finding #4: the decorative « » marks used to
              wrap this field unconditionally, so an empty quote read as a
              broken bare "«»" with nothing inside -- shown only once there's
              real text, while EditableText itself always stays mounted (not
              wrapped in `{quote && ...}` the way note/closingLine below are)
              so a host can still click into this field in the dashboard
              editor to write a first quote at all. */}
          {quote && "«"}
          <EditableText field="quote" value={quote} style={styleOverrides?.["quote"]} />
          {quote && "»"}
        </p>
        {note && (
          <p className={styles.note}>
            <EditableText field="note" value={note} style={styleOverrides?.["note"]} />
          </p>
        )}
        {/* Derived display text, not a raw content field -- not independently editable. */}
        {rsvpDeadline && isDeadlineUpcoming(rsvpDeadline) && (
          <p className={styles.deadline}>Please confirm by {formatDeadline(rsvpDeadline)}</p>
        )}
        {closingLine && (
          <p className={styles.closingLine}>
            <EditableText field="closingLine" value={closingLine} style={styleOverrides?.["closingLine"]} />
          </p>
        )}
      </div>
    </section>
  );
}
