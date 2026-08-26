import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
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
