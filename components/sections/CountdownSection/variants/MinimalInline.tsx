"use client";

import { useEffect, useState } from "react";
import type { CountdownSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./MinimalInline.module.css";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

function getTimeParts(eventDateTime: string) {
  const target = new Date(eventDateTime).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  return {
    reached: diff <= 0,
    past: now - target > ONE_DAY_MS,
    days: Math.floor(diff / ONE_DAY_MS),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function MinimalInline({ title, eventDateTime, styleOverrides, locale }: CountdownSectionVariantProps) {
  const t = getDictionary(locale).countdown;
  const { editable } = useEditableField();
  const [parts, setParts] = useState<ReturnType<typeof getTimeParts> | null>(null);

  useEffect(() => {
    const tick = () => setParts(getTimeParts(eventDateTime));
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
        <>
          <span className={styles.ghostNumber} aria-hidden="true">
            {pad(parts.days)}
          </span>
          <p className={styles.inline}>
            {pad(parts.days)} <span className={styles.label}>{t.daysAbbr}</span>
            <span className={styles.divider}>·</span>
            {pad(parts.hours)} <span className={styles.label}>{t.hoursAbbr}</span>
            <span className={styles.divider}>·</span>
            {pad(parts.minutes)} <span className={styles.label}>{t.minutesAbbr}</span>
            <span className={styles.divider}>·</span>
            {pad(parts.seconds)} <span className={styles.label}>{t.secondsAbbr}</span>
          </p>
        </>
      )}
    </section>
  );
}
