"use client";

import { useEffect, useState } from "react";
import type { CountdownSectionVariantProps } from "../types";
import { getCountdownParts, type CountdownParts } from "@/lib/countdown";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { CAP_DECOR } from "@/lib/themes/decorMotifs";
import styles from "./CircularRings.module.css";

export default function CircularRings({ title, eventDateTime, styleOverrides, themeCategory }: CountdownSectionVariantProps) {
  const { editable } = useEditableField();
  const capAsset = themeCategory ? CAP_DECOR[themeCategory] : undefined;
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
        <p className={styles.reached}>Thank you for celebrating with us!</p>
      ) : parts.reached ? (
        <p className={styles.reached}>Today&apos;s the day!</p>
      ) : (
        <div className={capAsset ? `${styles.ringsWrap} ${styles.ringsWrapColor}` : styles.ringsWrap}>
          {capAsset ? (
            <img className={styles.laurelCapColor} src={capAsset} alt="" aria-hidden="true" />
          ) : (
            <span className={styles.laurelCap} aria-hidden="true" />
          )}
          <div className={styles.rings}>
            <div className={styles.ring}>
              <span className={styles.number}>{parts.weeks}</span>
              <span className={styles.label}>Weeks</span>
            </div>
            <div className={styles.ring}>
              <span className={styles.number}>{parts.days}</span>
              <span className={styles.label}>Days</span>
            </div>
            <div className={styles.ring}>
              <span className={styles.number}>{parts.hours}</span>
              <span className={styles.label}>Hours</span>
            </div>
            <div className={styles.ring}>
              <span className={styles.number}>{parts.minutes}</span>
              <span className={styles.label}>Minutes</span>
            </div>
            <div className={styles.ring}>
              <span className={styles.number}>{parts.seconds}</span>
              <span className={styles.label}>Seconds</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
