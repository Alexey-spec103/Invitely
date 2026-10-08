import type { ReactNode } from "react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import CardCornerDecor from "./CardCornerDecor";
import { formatEventDate } from "./formatEventDate";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import styles from "./EnvelopeCardPreview.module.css";

export interface EnvelopeCardPreviewProps {
  theme: Theme;
  names: string[];
  eventDate: string;
  locale?: Locale;
  /** When set, replaces the default return-address text with arbitrary
   * content (in practice, a `CanvasRenderer` showing the host's own
   * customized text) -- the liner/border/corner decor stay fixed either
   * way. Fixes a real bug: customizing this envelope's text used to render
   * `CanvasRenderer` as a full replacement for this whole component,
   * silently dropping the liner/border/corner decor the moment a host
   * typed anything. The canvas data model only knows text/image/video/QR
   * elements, not decorative shapes -- it was never going to carry its own
   * copy of this chrome, so the fix is keeping this component as the one
   * source of it and only ever swapping the text layer inside it. */
  children?: ReactNode;
}

export default function EnvelopeCardPreview({
  theme,
  names,
  eventDate,
  locale = DEFAULT_LOCALE,
  children,
}: EnvelopeCardPreviewProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className={styles.face} style={{ containerType: "inline-size" }}>
        <div className={styles.liner} aria-hidden="true" />
        <div className={styles.border} />
        {/* Only bottom-right -- the return address sits top-left, a corner
            accent there would compete with real text. */}
        <CardCornerDecor themeCategory={effectiveDecorCategory(theme)} corners="bottomRightOnly" />
        {children ? (
          <div className={styles.customContent}>{children}</div>
        ) : (
          <>
            <div className={styles.returnFlourish}>
              <p className={styles.returnNames}>{names.join(" & ")}</p>
              <p className={styles.returnDate}>{formatEventDate(eventDate, locale).toUpperCase()}</p>
            </div>
            <div className={styles.addressArea}>
              <p className={styles.addressHint}>Guest address</p>
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
