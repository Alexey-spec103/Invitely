import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import CardWatermark from "./CardWatermark";
import styles from "./TableCardPreview.module.css";

export interface TableCardPreviewProps {
  theme: Theme;
  tableName: string;
  guestNames: string[];
  /** dashboard-audit.md B21: true when the event's plan is below Premium
   * -- table cards are a Premium-tier material in lib/plans.ts. Left
   * undefined (never true) at the marketing landing page's usage, which
   * has no real event/plan to gate on. */
  locked?: boolean;
}

/** DOM counterpart to `components/pdf/TableCardDocument.tsx` -- same data
 * shape (a table name + its seated guests), rendered live in the browser
 * instead of only inside a downloaded PDF, so it can appear in on-page
 * previews (e.g. the marketing "platform, not just an invitation" fan). */
export default function TableCardPreview({ theme, tableName, guestNames, locked }: TableCardPreviewProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className={styles.face} style={{ containerType: "inline-size" }}>
        <div className={styles.border} />
        <p className={styles.tableName}>{tableName}</p>
        <span className={styles.divider} aria-hidden="true" />
        {guestNames.map((name) => (
          <p key={name} className={styles.guestName}>
            {name}
          </p>
        ))}
        {locked && <CardWatermark repeat={24} />}
      </div>
    </ThemeProvider>
  );
}
