import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import CardWatermark from "./CardWatermark";
import styles from "./PlaceCardPreview.module.css";

export interface PlaceCardPreviewProps {
  theme: Theme;
  guestName: string;
  /** dashboard-audit.md B21: true when the event's plan is below Premium
   * -- place cards are a Premium-tier material in lib/plans.ts. */
  locked?: boolean;
}

/** DOM counterpart to `components/pdf/PlaceCardDocument.tsx` -- one guest's
 * name, rendered live instead of only inside a downloaded PDF. */
export default function PlaceCardPreview({ theme, guestName, locked }: PlaceCardPreviewProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className={styles.face} style={{ containerType: "inline-size" }}>
        <p className={styles.guestName}>{guestName}</p>
        {/* Place cards are small and already carry very little else on
            them -- a full-density tile would drown out the one line of
            text, so this gets fewer, smaller tiles than the other cards. */}
        {locked && <CardWatermark repeat={8} />}
      </div>
    </ThemeProvider>
  );
}
