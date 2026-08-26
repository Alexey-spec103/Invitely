"use client";

import { useEffect, useState } from "react";
import type { CountdownSectionVariantProps } from "../types";
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

export default function MinimalInline({ title, eventDateTime }: CountdownSectionVariantProps) {
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
        {title && <h2 className={styles.title}>{title}</h2>}
      </section>
    );
  }

  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}

      {parts.past ? (
        <p className={styles.reached}>Thank you for celebrating with us!</p>
      ) : parts.reached ? (
        <p className={styles.reached}>Today&apos;s the day!</p>
      ) : (
        <p className={styles.inline}>
          {pad(parts.days)} <span className={styles.label}>days</span>
          <span className={styles.divider}>·</span>
          {pad(parts.hours)} <span className={styles.label}>hrs</span>
          <span className={styles.divider}>·</span>
          {pad(parts.minutes)} <span className={styles.label}>min</span>
          <span className={styles.divider}>·</span>
          {pad(parts.seconds)} <span className={styles.label}>sec</span>
        </p>
      )}
    </section>
  );
}
