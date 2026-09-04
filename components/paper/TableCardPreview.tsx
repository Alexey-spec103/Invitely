import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import styles from "./TableCardPreview.module.css";

export interface TableCardPreviewProps {
  theme: Theme;
  tableName: string;
  guestNames: string[];
}

/** DOM counterpart to `components/pdf/TableCardDocument.tsx` -- same data
 * shape (a table name + its seated guests), rendered live in the browser
 * instead of only inside a downloaded PDF, so it can appear in on-page
 * previews (e.g. the marketing "platform, not just an invitation" fan). */
export default function TableCardPreview({ theme, tableName, guestNames }: TableCardPreviewProps) {
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
      </div>
    </ThemeProvider>
  );
}
