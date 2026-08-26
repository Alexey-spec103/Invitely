import type { GuestbookSectionVariantProps } from "../types";
import styles from "./MinimalList.module.css";

export default function MinimalList({ title, messages }: GuestbookSectionVariantProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}

      <div className={styles.list}>
        {messages.map((message, index) => (
          <div key={`${message.guestName}-${index}`} className={styles.row}>
            <p className={styles.comment}>{message.comment}</p>
            <p className={styles.author}>&mdash; {message.guestName}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
