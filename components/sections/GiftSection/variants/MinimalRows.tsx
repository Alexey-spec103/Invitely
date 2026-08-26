import type { GiftSectionVariantProps } from "../types";
import styles from "./MinimalRows.module.css";

export default function MinimalRows({ title, description, preferences }: GiftSectionVariantProps) {
  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {description && <p className={styles.description}>{description}</p>}

      {preferences.length > 0 && (
        <div className={styles.list}>
          {preferences.map((item) => (
            <div key={item.id} className={styles.row}>
              <div className={styles.rowText}>
                <p className={styles.rowTitle}>{item.title}</p>
                {item.description && <p className={styles.rowDescription}>{item.description}</p>}
              </div>
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className={styles.rowLink}>
                  View
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
