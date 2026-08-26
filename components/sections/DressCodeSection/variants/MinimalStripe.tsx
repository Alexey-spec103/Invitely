import type { DressCodeSectionVariantProps } from "../types";
import styles from "./MinimalStripe.module.css";

export default function MinimalStripe({ title, description, colors }: DressCodeSectionVariantProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.stripe} aria-hidden="true">
        {colors.map((color, index) => (
          <span
            key={`${color.hex}-${index}`}
            className={styles.band}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>

      <p className={styles.labels}>
        {colors
          .map((color) => color.label)
          .filter(Boolean)
          .join(" · ")}
      </p>
    </section>
  );
}
