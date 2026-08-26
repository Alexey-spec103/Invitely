"use client";

import type { ReactNode } from "react";
import styles from "./FlipCard.module.css";

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean;
}

/** A 3D flip container for cards with two printable sides -- both faces stay
 * mounted (so autosaved edits to the back keep rendering while the front is
 * showing) and `flipped` just rotates which one faces the viewer. */
export default function FlipCard({ front, back, flipped }: FlipCardProps) {
  return (
    <div className={styles.scene}>
      <div className={styles.card} style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
        <div className={styles.face}>{front}</div>
        <div className={`${styles.face} ${styles.back}`}>{back}</div>
      </div>
    </div>
  );
}
