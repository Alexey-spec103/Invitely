"use client";

import type { TravelSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { CORNER_PAIR_DECOR } from "@/lib/themes/decorMotifs";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./SimpleList.module.css";

/** Same card-grid shape as GiftSection's own SimpleList (closest template --
 * both are "title + description + a grid of host-added cards"). */
export default function SimpleList({
  title,
  description,
  items,
  styleOverrides,
  themeCategory,
  locale,
}: TravelSectionVariantProps) {
  const { editable } = useEditableField();
  const t = getDictionary(locale).travel;
  const accentAssets = themeCategory ? CORNER_PAIR_DECOR[themeCategory] : undefined;
  return (
    <section className={accentAssets ? `${styles.section} ${styles.sectionColor}` : styles.section}>
      {accentAssets && (
        <>
          <img className={styles.accentTopLeft} src={accentAssets[0]} alt="" aria-hidden="true" />
          <img className={styles.accentBottomRight} src={accentAssets[1]} alt="" aria-hidden="true" />
        </>
      )}
      {(title || editable) && (
        <h2 className={styles.title}>
          <EditableText field="title" value={title ?? ""} style={styleOverrides?.["title"]} />
        </h2>
      )}
      {(description || editable) && (
        <p className={styles.description}>
          <EditableText
            field="description"
            value={description ?? ""}
            style={styleOverrides?.["description"]}
            placeholder="Where we recommend staying…"
          />
        </p>
      )}

      {items.length > 0 && (
        <div className={styles.grid}>
          {items.map((item, index) => (
            <div key={index} className={styles.card}>
              <span className={styles.cardMark} aria-hidden="true" />
              <p className={styles.cardTitle}>
                <EditableText
                  field={`items.${index}.name`}
                  value={item.name}
                  style={styleOverrides?.[`items.${index}.name`]}
                  placeholder="Hotel or place name"
                />
              </p>
              {(item.description || editable) && (
                <p className={styles.cardDescription}>
                  <EditableText
                    field={`items.${index}.description`}
                    value={item.description ?? ""}
                    style={styleOverrides?.[`items.${index}.description`]}
                    placeholder="A short note -- distance, style, why you picked it"
                  />
                </p>
              )}
              {(item.priceText || editable) && (
                <p className={styles.cardPrice}>
                  <EditableText
                    field={`items.${index}.priceText`}
                    value={item.priceText ?? ""}
                    style={styleOverrides?.[`items.${index}.priceText`]}
                    placeholder="From $120/night"
                  />
                </p>
              )}
              {item.promoCode && <p className={styles.cardPromo}>{t.promoCodeLabel}: {item.promoCode}</p>}
              {item.bookingUrl && (
                <a href={item.bookingUrl} target="_blank" rel="noreferrer" className={styles.cardLink}>
                  {t.bookingLink}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
