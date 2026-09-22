import type { MapSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./MinimalList.module.css";

export default function MinimalList({ title, venues, styleOverrides, locale }: MapSectionVariantProps) {
  const t = getDictionary(locale).map;
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
            <div key={`${venue.name}-${index}`} className={styles.entry}>
              <div className={styles.text}>
                <div className={styles.venueRow}>
                  <span className={styles.venueMark} aria-hidden="true" />
                  <p className={styles.venueName}>
                    <EditableText
                      field={`venues.${index}.name`}
                      value={venue.name}
                      style={styleOverrides?.[`venues.${index}.name`]}
                    />
                  </p>
                </div>
                <p className={styles.venueAddress}>
                  <EditableText
                    field={`venues.${index}.address`}
                    value={venue.address}
                    style={styleOverrides?.[`venues.${index}.address`]}
                  />
                </p>
              </div>
              <div className={styles.mapWrapper}>
                <iframe
                  className={styles.map}
                  src={src}
                  title={t.mapTitle(venue.name)}
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
