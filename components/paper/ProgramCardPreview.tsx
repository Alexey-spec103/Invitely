import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import styles from "./ProgramCardPreview.module.css";

export interface ProgramCardEvent {
  time: string;
  title: string;
  description?: string;
}

export interface ProgramCardPreviewProps {
  theme: Theme;
  title?: string;
  events: ProgramCardEvent[];
}

export default function ProgramCardPreview({ theme, title, events }: ProgramCardPreviewProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className={styles.face} style={{ containerType: "inline-size" }}>
        <div className={styles.border} />
        <p className={styles.title}>{title || "Order of the day"}</p>
        {events.map((event, index) => (
          <div key={index} className={styles.row}>
            <p className={styles.time}>{event.time}</p>
            <div className={styles.eventBody}>
              <p className={styles.eventTitle}>{event.title}</p>
              {event.description && <p className={styles.eventDescription}>{event.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </ThemeProvider>
  );
}
