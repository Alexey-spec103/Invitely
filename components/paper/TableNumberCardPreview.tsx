import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import CardWatermark from "./CardWatermark";
import styles from "./TableNumberCardPreview.module.css";

export interface TableNumberCardPreviewProps {
  theme: Theme;
  tableName: string;
  /** dashboard-audit.md B21: true when the event's plan is below Premium
   * -- table-number cards are a Premium-tier material in lib/plans.ts. */
  locked?: boolean;
}

/** DOM counterpart to `components/pdf/TableNumberCardDocument.tsx` -- a
 * freestanding table-number placard (just the name/number, no guest list),
 * rendered live instead of only inside a downloaded PDF. */
export default function TableNumberCardPreview({ theme, tableName, locked }: TableNumberCardPreviewProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className={styles.face} style={{ containerType: "inline-size" }}>
        <div className={styles.border} />
        <p className={styles.tableName}>{tableName}</p>
        {locked && <CardWatermark repeat={16} />}
      </div>
    </ThemeProvider>
  );
}
