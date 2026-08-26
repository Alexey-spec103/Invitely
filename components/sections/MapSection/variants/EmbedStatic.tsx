import type { MapSectionVariantProps } from "../types";
import styles from "./EmbedStatic.module.css";

export default function EmbedStatic({ title, venues }: MapSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.stack}>
        <h2 className={styles.title}>{title}</h2>
        {(venues ?? []).map((venue, index) => {
          const query = encodeURIComponent(`${venue.name}, ${venue.address}`);
          const src = `https://www.google.com/maps?q=${query}&output=embed`;

          return (
            <div key={`${venue.name}-${index}`} className={styles.card}>
              <span className={styles.flourishTopLeft} aria-hidden="true" />
              <span className={styles.flourishBottomRight} aria-hidden="true" />
              <p className={styles.venueName}>{venue.name}</p>
              <p className={styles.venueAddress}>{venue.address}</p>
              <div className={styles.mapWrapper}>
                <iframe
                  className={styles.map}
                  src={src}
                  title={`Map: ${venue.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
