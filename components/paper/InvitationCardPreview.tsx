import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import CardCornerDecor from "./CardCornerDecor";
import FlipCard from "./FlipCard";
import { formatEventDate } from "./formatEventDate";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import styles from "./InvitationCardPreview.module.css";

export interface InvitationCardPreviewProps {
  theme: Theme;
  names: string[];
  eventDate: string;
  venueName?: string;
  venueAddress?: string;
  side: "front" | "back";
  backMessage?: string;
  locale?: Locale;
}

export default function InvitationCardPreview({
  theme,
  names,
  eventDate,
  venueName,
  venueAddress,
  side,
  backMessage,
  locale = DEFAULT_LOCALE,
}: InvitationCardPreviewProps) {
  const themeCategory = effectiveDecorCategory(theme);
  return (
    <ThemeProvider theme={theme}>
      <FlipCard
        flipped={side === "back"}
        front={
          <div className={styles.face} style={{ containerType: "inline-size" }}>
            <div className={styles.border} />
            <CardCornerDecor themeCategory={themeCategory} />
            <p className={styles.names}>{names[0]}</p>
            {names[1] && (
              <>
                <p className={styles.ampersand}>&amp;</p>
                <p className={styles.names}>{names[1]}</p>
              </>
            )}
            <p className={styles.date}>{formatEventDate(eventDate, locale).toUpperCase()}</p>
            {(venueName || venueAddress) && (
              <p className={styles.venue}>{[venueName, venueAddress].filter(Boolean).join(" · ")}</p>
            )}
          </div>
        }
        back={
          <div className={styles.face} style={{ containerType: "inline-size" }}>
            <div className={styles.border} />
            <CardCornerDecor themeCategory={themeCategory} />
            <p className={styles.backAmpersand}>&amp;</p>
            <p className={backMessage ? styles.backMessage : styles.backMessagePlaceholder}>
              {backMessage || "Add a note for the back of your card..."}
            </p>
          </div>
        }
      />
    </ThemeProvider>
  );
}
