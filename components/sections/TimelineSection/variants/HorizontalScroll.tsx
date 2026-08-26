import type { TimelineSectionVariantProps } from "../types";
import styles from "./HorizontalScroll.module.css";

export default function HorizontalScroll({ title, events }: TimelineSectionVariantProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.track}>
        {events.map((event) => (
          <div key={`${event.time}-${event.title}`} className={styles.card}>
            <span className={styles.time}>{event.time}</span>
            <span className={styles.eventTitle}>{event.title}</span>
            {event.description && (
              <span className={styles.description}>{event.description}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
