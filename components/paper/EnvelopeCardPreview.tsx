import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import CardCornerDecor from "./CardCornerDecor";
import { formatEventDate } from "./formatEventDate";
import styles from "./EnvelopeCardPreview.module.css";

export interface EnvelopeCardPreviewProps {
  theme: Theme;
  names: string[];
  eventDate: string;
}

export default function EnvelopeCardPreview({ theme, names, eventDate }: EnvelopeCardPreviewProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className={styles.face} style={{ containerType: "inline-size" }}>
        <div className={styles.border} />
        {/* Only bottom-right -- the return address sits top-left, a corner
            accent there would compete with real text. */}
        <CardCornerDecor themeCategory={effectiveDecorCategory(theme)} corners="bottomRightOnly" />
        <div className={styles.returnFlourish}>
          <p className={styles.returnNames}>{names.join(" & ")}</p>
          <p className={styles.returnDate}>{formatEventDate(eventDate).toUpperCase()}</p>
        </div>
        <div className={styles.addressArea}>
          <p className={styles.addressHint}>Guest address</p>
        </div>
      </div>
    </ThemeProvider>
  );
}
