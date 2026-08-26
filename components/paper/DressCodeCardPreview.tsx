import ThemeProvider from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/themes";
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
}

export default function DressCodeCardPreview({ theme, title, description, colors }: DressCodeCardPreviewProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className={styles.face} style={{ containerType: "inline-size" }}>
        <div className={styles.border} />
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
      </div>
    </ThemeProvider>
  );
}
