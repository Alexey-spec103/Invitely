import type { TimelineSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./HorizontalScroll.module.css";

export default function HorizontalScroll({ title, events, styleOverrides }: TimelineSectionVariantProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        <EditableText field="title" value={title} style={styleOverrides?.["title"]} />
      </h2>
      <div className={styles.track}>
        {events.map((event, index) => (
          <div key={index} className={styles.card}>
            <span className={styles.cardMark} aria-hidden="true" />
            <span className={styles.time}>
              <EditableText field={`events.${index}.time`} value={event.time} style={styleOverrides?.[`events.${index}.time`]} />
            </span>
            <span className={styles.eventTitle}>
              <EditableText field={`events.${index}.title`} value={event.title} style={styleOverrides?.[`events.${index}.title`]} />
            </span>
            {event.description && (
              <span className={styles.description}>
                <EditableText
                  field={`events.${index}.description`}
                  value={event.description}
                  style={styleOverrides?.[`events.${index}.description`]}
                />
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
