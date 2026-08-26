"use client";

import { useEffect, useState } from "react";
import type { CountdownSectionVariantProps } from "../types";
import { getCountdownParts, type CountdownParts } from "@/lib/countdown";
import styles from "./SimpleDigits.module.css";

export default function SimpleDigits({ title, eventDateTime }: CountdownSectionVariantProps) {
  // Null until mount: computing this during the server render would embed a
  // Date.now() snapshot that won't match the client's hydration-time value,
  // triggering a hydration mismatch. Real numbers only ever appear client-side.
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const tick = () => setParts(getCountdownParts(eventDateTime));
    // Deferred via setTimeout (not called directly in the effect body) so the
    // first paint lands almost immediately without triggering a synchronous
    // cascading render.
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
        <div className={styles.digits}>
          <div className={styles.digit}>
            <span className={styles.number}>{parts.weeks}</span>
            <span className={styles.label}>Weeks</span>
          </div>
          <div className={styles.digit}>
            <span className={styles.number}>{parts.days}</span>
            <span className={styles.label}>Days</span>
          </div>
          <div className={styles.digit}>
            <span className={styles.number}>{parts.hours}</span>
            <span className={styles.label}>Hours</span>
          </div>
          <div className={styles.digit}>
            <span className={styles.number}>{parts.minutes}</span>
            <span className={styles.label}>Minutes</span>
          </div>
          <div className={styles.digit}>
            <span className={styles.number}>{parts.seconds}</span>
            <span className={styles.label}>Seconds</span>
          </div>
        </div>
      )}
    </section>
  );
}
