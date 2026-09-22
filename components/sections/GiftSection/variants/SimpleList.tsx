"use client";

import type { GiftSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { CORNER_PAIR_DECOR } from "@/lib/themes/decorMotifs";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./SimpleList.module.css";

/** No pre-existing decoration to preserve here for any category (unlike
 * Hero/Countdown/DressCode, which mask-fallback), so unmatched categories
 * simply render nothing extra -- no regression risk. */
export default function SimpleList({ title, description, preferences, styleOverrides, themeCategory, locale }: GiftSectionVariantProps) {
  const { editable } = useEditableField();
  const t = getDictionary(locale).gift;
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
          <EditableText field="description" value={description ?? ""} style={styleOverrides?.["description"]} />
        </p>
      )}

      {preferences.length > 0 && (
        <div className={styles.grid}>
          {preferences.map((item) => (
            <div key={item.id} className={styles.card}>
              <span className={styles.cardMark} aria-hidden="true" />
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.title} className={styles.image} />
              )}
              <p className={styles.cardTitle}>{item.title}</p>
              {item.description && <p className={styles.cardDescription}>{item.description}</p>}
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className={styles.cardLink}>
                  {t.viewLink}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
