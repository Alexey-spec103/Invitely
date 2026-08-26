import type { TimelineSectionVariantProps } from "../types";
import styles from "./AlternatingSides.module.css";

export default function AlternatingSides({ title, events }: TimelineSectionVariantProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <ol className={styles.list}>
        {events.map((event) => (
          <li key={`${event.time}-${event.title}`} className={styles.item}>
            <span className={styles.dot} aria-hidden="true" />
            <div className={styles.content}>
              <span className={styles.time}>{event.time}</span>
              <span className={styles.eventTitle}>{event.title}</span>
              {event.description && (
                <span className={styles.description}>{event.description}</span>
              )}
            </div>
            <div className={styles.spacer} aria-hidden="true" />
          </li>
        ))}
      </ol>
    </section>
  );
}
