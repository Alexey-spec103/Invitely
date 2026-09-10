import styles from "./CardWatermark.module.css";

interface CardWatermarkProps {
  /** Smaller cards (place cards) need fewer, smaller tiles or the pattern
   * overwhelms the one line of text already on the card. */
  repeat?: number;
}

/** dashboard-audit.md B21: weddingpost.ru's own "НЕ ОПЛАЧЕНО" diagonal
 * repeating watermark on unpaid layouts. Invitely has no real payment to
 * gate on, so this fires off the plan tier `lib/plans.ts` already
 * (unenforced) claims requires Premium for banquet/table-card materials --
 * not an actual charge. The design stays fully visible and still
 * downloads; it's just honestly marked as a Premium-tier material. */
export default function CardWatermark({ repeat = 24 }: CardWatermarkProps) {
  return (
    <div className={styles.wrap} aria-hidden="true">
      {Array.from({ length: repeat }, (_, i) => (
        <span key={i} className={styles.label}>
          PREMIUM ONLY
        </span>
      ))}
    </div>
  );
}
