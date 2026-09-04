import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import styles from "./PlaceCardPreview.module.css";

export interface PlaceCardPreviewProps {
  theme: Theme;
  guestName: string;
}

/** DOM counterpart to `components/pdf/PlaceCardDocument.tsx` -- one guest's
 * name, rendered live instead of only inside a downloaded PDF. */
export default function PlaceCardPreview({ theme, guestName }: PlaceCardPreviewProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className={styles.face} style={{ containerType: "inline-size" }}>
        <p className={styles.guestName}>{guestName}</p>
      </div>
    </ThemeProvider>
  );
}
