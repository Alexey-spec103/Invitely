import type { DressCodeSectionVariantProps } from "../types";
import styles from "./ColorPalette.module.css";

export default function ColorPalette({ title, description, colors }: DressCodeSectionVariantProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.swatches}>
        {colors.map((color, index) => (
          <div key={`${color.hex}-${index}`} className={styles.swatch}>
            <span className={styles.chip} style={{ backgroundColor: color.hex }} aria-hidden="true" />
            {color.label && <span className={styles.label}>{color.label}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
