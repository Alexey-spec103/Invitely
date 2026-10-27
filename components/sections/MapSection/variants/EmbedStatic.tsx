"use client";

import type { MapSectionVariantProps } from "../types";
import { mapEmbedSrc } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./EmbedStatic.module.css";

export default function EmbedStatic({ title, venues, styleOverrides, locale }: MapSectionVariantProps) {
  const { editable } = useEditableField();
  const t = getDictionary(locale).map;
  return (
    <section className={styles.section}>
      <div className={styles.stack}>
        {/* Accessibility audit (2026-10-22): this used to render an
            unconditional <h2> regardless of content -- a guest-facing event
            with no map title typed in (this test event included) shipped a
            genuinely empty heading to every visitor, which a screen reader
            announces as "heading level 2, blank" when navigating by
            headings (WCAG 2.4.6). Same `(value || editable) && ...` guard
            LetterSection/CenteredCard already uses for its own optional
            fields -- still renders for a host in the dashboard editor so
            there's something to click into and type a first title. */}
        {(title || editable) && (
          <div className={styles.titleRow}>
            <span className={styles.titleFlourish} aria-hidden="true" />
            <h2 className={styles.title}>
              <EditableText field="title" value={title} style={styleOverrides?.["title"]} />
            </h2>
            <span className={`${styles.titleFlourish} ${styles.titleFlourishRight}`} aria-hidden="true" />
          </div>
        )}
        {/* UX audit (2026-10-26): a host who enables Location before adding
            any venue previously shipped guests a visually empty section --
            no map, no address, no message, indistinguishable from a bug.
            The editable dashboard view already prompts the host to add a
            venue elsewhere, so this fallback only needs to cover guests. */}
        {(venues ?? []).length === 0 && !editable && <p className={styles.venueAddress}>{t.noVenuesYet}</p>}
        {(venues ?? []).map((venue, index) => {
          const src = mapEmbedSrc(venue);

          return (
            <div key={index} className={styles.card}>
              {/* Mobile confirmation pass (2026-10-27): was a <p> -- with no
                  own heading, a venue's name read as plain body text to a
                  screen reader navigating by headings, even though it's
                  visually the start of each card. h3 nests correctly under
                  this section's own h2 title above. */}
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
    </section>
  );
}
