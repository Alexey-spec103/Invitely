import type { TimelineSectionVariantProps } from "../types";
import styles from "./VerticalLine.module.css";

export default function VerticalLine({ title, events }: TimelineSectionVariantProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <ol className={styles.list}>
        {events.map((event) => (
          <li key={`${event.time}-${event.title}`} className={styles.item}>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.time}>{event.time}</span>
            <span className={styles.eventTitle}>{event.title}</span>
            {event.description && (
              <span className={styles.description}>{event.description}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
