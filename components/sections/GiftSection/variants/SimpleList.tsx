import type { GiftSectionVariantProps } from "../types";
import styles from "./SimpleList.module.css";

export default function SimpleList({ title, description, preferences }: GiftSectionVariantProps) {
  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {description && <p className={styles.description}>{description}</p>}

      {preferences.length > 0 && (
        <div className={styles.grid}>
          {preferences.map((item) => (
            <div key={item.id} className={styles.card}>
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.title} className={styles.image} />
              )}
              <p className={styles.cardTitle}>{item.title}</p>
              {item.description && <p className={styles.cardDescription}>{item.description}</p>}
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className={styles.cardLink}>
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
