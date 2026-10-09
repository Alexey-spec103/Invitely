import type { ReactNode } from "react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import CardCornerDecor from "./CardCornerDecor";
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
  /** When set, replaces the default title+schedule with arbitrary content
   * (in practice, a `CanvasRenderer` showing the host's own customized
   * text) -- the border/corner decor stay fixed either way. Same fix as
   * EnvelopeCardPreview: customizing this card's text used to render
   * `CanvasRenderer` as a full replacement for this whole component,
   * silently dropping the border/corner decor the moment a host typed
   * anything. */
  children?: ReactNode;
}

export default function ProgramCardPreview({ theme, title, events, children }: ProgramCardPreviewProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className={styles.face} style={{ containerType: "inline-size" }}>
        <div className={styles.border} />
        <CardCornerDecor themeCategory={effectiveDecorCategory(theme)} />
        {children ? (
          <div className={styles.customContent}>{children}</div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
