import type { ReactNode } from "react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import CardCornerDecor from "./CardCornerDecor";
import styles from "./DressCodeCardPreview.module.css";

export interface DressCodeCardColor {
  hex: string;
  label?: string;
}

export interface DressCodeCardPreviewProps {
  theme: Theme;
  title: string;
  description?: string;
  colors: DressCodeCardColor[];
  /** When set, replaces the default title+description+swatches with
   * arbitrary content (in practice, a `CanvasRenderer` showing the host's
   * own customized text) -- the border/corner decor stay fixed either way.
   * Same fix as EnvelopeCardPreview: customizing this card's text used to
   * render `CanvasRenderer` as a full replacement for this whole component,
   * silently dropping the border/corner decor the moment a host typed
   * anything. The color swatches aren't reproduced by the canvas seed
   * either (it has no dedicated swatch element -- see
   * createDressCodeCanvasSeed's own comment), so like the title/description
   * they get replaced by custom content too, not preserved alongside it;
   * only the border/corner decor is guaranteed to survive. */
  children?: ReactNode;
}

export default function DressCodeCardPreview({ theme, title, description, colors, children }: DressCodeCardPreviewProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className={styles.face} style={{ containerType: "inline-size" }}>
        <div className={styles.border} />
        <CardCornerDecor themeCategory={effectiveDecorCategory(theme)} />
        {children ? (
          <div className={styles.customContent}>{children}</div>
        ) : (
          <>
            <p className={styles.title}>{title}</p>
            {description && <p className={styles.description}>{description}</p>}
            <div className={styles.swatchRow}>
              {colors.map((color, index) => (
                <div key={index} className={styles.swatchColumn}>
                  <div className={styles.swatch} style={{ backgroundColor: color.hex }} />
                  {color.label && <p className={styles.swatchLabel}>{color.label}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
