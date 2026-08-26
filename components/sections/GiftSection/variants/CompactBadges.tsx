import type { GiftSectionVariantProps } from "../types";
import styles from "./CompactBadges.module.css";

export default function CompactBadges({ title, description, preferences }: GiftSectionVariantProps) {
  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {description && <p className={styles.description}>{description}</p>}

      {preferences.length > 0 && (
        <div className={styles.wrap}>
          {preferences.map((item) =>
            item.url ? (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={styles.badge}
              >
                {item.title}
              </a>
            ) : (
              <span key={item.id} className={styles.badge}>
                {item.title}
              </span>
            )
          )}
        </div>
      )}
    </section>
  );
}
