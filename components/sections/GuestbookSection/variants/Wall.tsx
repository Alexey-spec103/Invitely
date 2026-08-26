import type { GuestbookSectionVariantProps } from "../types";
import styles from "./Wall.module.css";

export default function Wall({ title, messages }: GuestbookSectionVariantProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}

      <div className={styles.grid}>
        {messages.map((message, index) => (
          <div key={`${message.guestName}-${index}`} className={styles.card}>
            <p className={styles.comment}>&ldquo;{message.comment}&rdquo;</p>
            <p className={styles.author}>{message.guestName}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
