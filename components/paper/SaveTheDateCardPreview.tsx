import type { ReactNode } from "react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import CardCornerDecor from "./CardCornerDecor";
import { formatEventDate } from "./formatEventDate";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import styles from "./SaveTheDateCardPreview.module.css";

export interface SaveTheDateCardPreviewProps {
  theme: Theme;
  names: string[];
  eventDate: string;
  locale?: Locale;
  /** When set, replaces the default names/date/line text with arbitrary
   * content (in practice, a `CanvasRenderer` showing the host's own
   * customized text) -- the border/corner decor stay fixed either way. Same
   * children-wrapped shape as EnvelopeCardPreview's fix: the canvas data
   * model has no decorative-shape element type, so this component stays the
   * one source of that chrome and only ever swaps the text layer inside it. */
  children?: ReactNode;
}

export default function SaveTheDateCardPreview({
  theme,
  names,
  eventDate,
  locale = DEFAULT_LOCALE,
  children,
}: SaveTheDateCardPreviewProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className={styles.face} style={{ containerType: "inline-size" }}>
        <div className={styles.border} />
        <CardCornerDecor themeCategory={effectiveDecorCategory(theme)} />
        {children ? (
          <div className={styles.customContent}>{children}</div>
        ) : (
          <>
            <p className={styles.eyebrow}>Save the date</p>
            <p className={styles.names}>{names.join(" & ")}</p>
            <p className={styles.date}>{formatEventDate(eventDate, locale)}</p>
            <p className={styles.note}>Formal invitation to follow</p>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
