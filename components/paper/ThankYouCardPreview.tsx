import type { ReactNode } from "react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import CardCornerDecor from "./CardCornerDecor";
import styles from "./ThankYouCardPreview.module.css";

export interface ThankYouCardPreviewProps {
  theme: Theme;
  names: string[];
  /** Same children-wrapped decor-preservation shape as EnvelopeCardPreview
   * and SaveTheDateCardPreview -- the border/corner decor stay fixed
   * regardless of customization. */
  children?: ReactNode;
}

export default function ThankYouCardPreview({ theme, names, children }: ThankYouCardPreviewProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className={styles.face} style={{ containerType: "inline-size" }}>
        <div className={styles.border} />
        <CardCornerDecor themeCategory={effectiveDecorCategory(theme)} />
        {children ? (
          <div className={styles.customContent}>{children}</div>
        ) : (
          <>
            <p className={styles.title}>Thank You</p>
            <p className={styles.message}>
              Thank you for celebrating with us -- your presence meant more than words can say.
            </p>
            <p className={styles.names}>{names.join(" & ")}</p>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
