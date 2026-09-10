import TableNumberCardPreview from "@/components/paper/TableNumberCardPreview";
import PlaceCardPreview from "@/components/paper/PlaceCardPreview";
import TableCardPreview from "@/components/paper/TableCardPreview";
import type { Theme } from "@/lib/themes";
import styles from "./BanquetShowcase.module.css";

interface BanquetShowcaseProps {
  theme: Theme;
  tableName?: string;
  guestNames?: string[];
  /** dashboard-audit.md B21: true when the event's plan is below Premium. */
  locked?: boolean;
}

const DEMO_TABLE_NAME = "Table 1";
const DEMO_GUEST_NAMES = ["Emma Carter", "Jack Carter", "Olivia Bennett", "Noah Bennett"];

// A real, elegant reception table -- glasses, cutlery, florals, no posed
// people (a posed-couple/guest photo would misrepresent someone else's real
// wedding as this host's own, same reasoning as previewMedia.ts's theme
// gallery photos). Sourced from Unsplash, free for commercial use.
const SHOWCASE_PHOTO_URL = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400&q=70&fit=crop&auto=format";

/** dashboard-audit.md B15: weddingpost.ru's "Витрина банкета" -- a large
 * photo of a real set table with the couple's own theme-styled table-number/
 * place/table cards overlaid on it, "мокап в реальной сцене" rather than
 * flat previews floating on white. Confirmed live: the photo is bleached
 * toward white (not plain grayscale) specifically so the colored cards read
 * clearly against it.
 *
 * Reuses the exact same theme-aware preview components Paper/Invitations
 * already use (`TableNumberCardPreview`/`PlaceCardPreview`/`TableCardPreview`)
 * so this can never drift out of sync with what those actually render --
 * only the composition (photo + scatter + tilt) is new. Falls back to a
 * short demo table/guest list when the host hasn't added either yet, so this
 * always sells the outcome instead of disappearing on a brand-new event
 * (the audit's own critique: "Seating -- голая форма без единого изображения.
 * Пользователь не видит, что он получит"). */
export default function BanquetShowcase({ theme, tableName, guestNames, locked }: BanquetShowcaseProps) {
  const resolvedTableName = tableName || DEMO_TABLE_NAME;
  const resolvedGuestNames = guestNames && guestNames.length > 0 ? guestNames : DEMO_GUEST_NAMES;

  return (
    <div className={styles.scene}>
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative background photo, not a Next/Image-worthy content asset */}
      <img src={SHOWCASE_PHOTO_URL} alt="" className={styles.photo} />

      <div className={`${styles.item} ${styles.tableNumber}`}>
        <TableNumberCardPreview theme={theme} tableName="1" locked={locked} />
      </div>

      <div className={`${styles.item} ${styles.place}`}>
        <PlaceCardPreview theme={theme} guestName={resolvedGuestNames[0]} locked={locked} />
      </div>

      <div className={`${styles.item} ${styles.table}`}>
        <TableCardPreview theme={theme} tableName={resolvedTableName} guestNames={resolvedGuestNames} locked={locked} />
      </div>
    </div>
  );
}
