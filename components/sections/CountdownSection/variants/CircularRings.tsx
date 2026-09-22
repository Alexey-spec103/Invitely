"use client";

import { useEffect, useState } from "react";
import type { CountdownSectionVariantProps } from "../types";
import { getCountdownParts, type CountdownParts } from "@/lib/countdown";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { CAP_DECOR, CATEGORY_MASK_ACCENT } from "@/lib/themes/decorMotifs";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./CircularRings.module.css";

export default function CircularRings({
  title,
  eventDateTime,
  styleOverrides,
  themeCategory,
  locale,
}: CountdownSectionVariantProps) {
  const t = getDictionary(locale).countdown;
  const { editable } = useEditableField();
  const capAsset = themeCategory ? CAP_DECOR[themeCategory] : undefined;
  // Categories with no full-color CAP_DECOR entry (currently modern/minimal
  // only) get their own hand-authored mask accent instead of the fully
  // generic laurel-wreath fallback -- see decorMotifs.ts's own comment.
  const maskAccent = !capAsset && themeCategory ? CATEGORY_MASK_ACCENT[themeCategory] : undefined;
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const tick = () => setParts(getCountdownParts(eventDateTime));
    const immediate = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(immediate);
      clearInterval(interval);
    };
  }, [eventDateTime]);

  if (!parts) {
    return (
      <section className={styles.section}>
        {(title || editable) && (
        <h2 className={styles.title}>
          <EditableText field="title" value={title ?? ""} style={styleOverrides?.["title"]} />
        </h2>
      )}
      </section>
    );
  }

  return (
    <section className={styles.section}>
      {(title || editable) && (
        <h2 className={styles.title}>
          <EditableText field="title" value={title ?? ""} style={styleOverrides?.["title"]} />
        </h2>
      )}

      {parts.past ? (
        <p className={styles.reached}>{t.reachedPast}</p>
      ) : parts.reached ? (
        <p className={styles.reached}>{t.reachedToday}</p>
      ) : (
        <div className={capAsset ? `${styles.ringsWrap} ${styles.ringsWrapColor}` : styles.ringsWrap}>
          {capAsset ? (
            <img className={styles.laurelCapColor} src={capAsset} alt="" aria-hidden="true" />
          ) : (
            <span
              className={styles.laurelCap}
              style={
                maskAccent
                  ? { maskImage: `url(${maskAccent})`, WebkitMaskImage: `url(${maskAccent})` }
                  : undefined
              }
              aria-hidden="true"
            />
          )}
          <div className={styles.rings}>
            <div className={styles.ring}>
              <span className={styles.number}>{parts.weeks}</span>
              <span className={styles.label}>{t.weeks}</span>
            </div>
            <div className={styles.ring}>
              <span className={styles.number}>{parts.days}</span>
              <span className={styles.label}>{t.days}</span>
            </div>
            <div className={styles.ring}>
              <span className={styles.number}>{parts.hours}</span>
              <span className={styles.label}>{t.hours}</span>
            </div>
            <div className={styles.ring}>
              <span className={styles.number}>{parts.minutes}</span>
              <span className={styles.label}>{t.minutes}</span>
            </div>
            <div className={styles.ring}>
              <span className={styles.number}>{parts.seconds}</span>
              <span className={styles.label}>{t.seconds}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
