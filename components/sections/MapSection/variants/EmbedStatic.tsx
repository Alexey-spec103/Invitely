import type { MapSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import styles from "./EmbedStatic.module.css";

export default function EmbedStatic({ title, venues, styleOverrides }: MapSectionVariantProps) {
  return (
    <section className={styles.section}>
      <div className={styles.stack}>
        <h2 className={styles.title}>
          <EditableText field="title" value={title} style={styleOverrides?.["title"]} />
        </h2>
        {(venues ?? []).map((venue, index) => {
          const query = encodeURIComponent(`${venue.name}, ${venue.address}`);
          const src = `https://www.google.com/maps?q=${query}&output=embed`;

          return (
            <div key={index} className={styles.card}>
              <p className={styles.venueName}>
                <EditableText
                  field={`venues.${index}.name`}
                  value={venue.name}
                  style={styleOverrides?.[`venues.${index}.name`]}
                />
              </p>
              <p className={styles.venueAddress}>
                <EditableText
                  field={`venues.${index}.address`}
                  value={venue.address}
                  style={styleOverrides?.[`venues.${index}.address`]}
                />
              </p>
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
