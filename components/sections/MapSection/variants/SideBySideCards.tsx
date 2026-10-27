"use client";

import type { MapSectionVariantProps } from "../types";
import { mapEmbedSrc } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./SideBySideCards.module.css";

export default function SideBySideCards({ title, venues, styleOverrides, locale }: MapSectionVariantProps) {
  const { editable } = useEditableField();
  const t = getDictionary(locale).map;
  return (
    <section className={styles.section}>
      <div className={styles.stack}>
        {/* Accessibility audit (2026-10-22): an unconditional heading here
            ships an empty <h2></h2> to a guest when a host leaves this
            title blank -- a screen reader announces "heading level 2,
            blank" (WCAG 2.4.6). Same fix as LetterSection/CenteredCard.tsx
            and MapSection/EmbedStatic.tsx. */}
        {(title || editable) && (
          <h2 className={styles.title}>
            <EditableText field="title" value={title} style={styleOverrides?.["title"]} />
          </h2>
        )}
        {/* UX audit (2026-10-26): same gap as MapSection/EmbedStatic.tsx --
            a host who enables Location before adding any venue previously
            shipped guests a visually empty section. */}
        {(venues ?? []).length === 0 && !editable && <p className={styles.venueAddress}>{t.noVenuesYet}</p>}
        <div className={styles.grid}>
          {(venues ?? []).map((venue, index) => {
            const src = mapEmbedSrc(venue);

            return (
              <div key={`${venue.name}-${index}`} className={styles.card}>
                <span className={styles.cardMark} aria-hidden="true" />
                {/* Mobile confirmation pass (2026-10-27): h3, not p --
                    same reasoning as EmbedStatic's own venueName. */}
                <h3 className={styles.venueName}>
                  <EditableText
                    field={`venues.${index}.name`}
                    value={venue.name}
                    style={styleOverrides?.[`venues.${index}.name`]}
                  />
                </h3>
                <p className={styles.venueAddress}>
                  <EditableText
                    field={`venues.${index}.address`}
                    value={venue.address}
                    style={styleOverrides?.[`venues.${index}.address`]}
                  />
                </p>
                {(src || editable) && (
                  <div className={styles.mapWrapper}>
                    {src ? (
                      <iframe
                        className={styles.map}
                        src={src}
                        title={t.mapTitle(venue.name)}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    ) : (
                      <p className={styles.mapPlaceholder}>{t.mapPlaceholder}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
