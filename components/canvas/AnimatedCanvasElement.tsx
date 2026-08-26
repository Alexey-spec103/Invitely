"use client";

import { motion, type MotionStyle } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedCanvasElementProps {
  duration: number;
  style: MotionStyle;
  className?: string;
  children: ReactNode;
}

/** Wraps one canvas element with a fade+rise-in entrance animation, timed by
 * `animationDuration` from the editor. Mirrors `RevealOnScroll`'s exact
 * whileInView pattern (same framer-motion primitives), just parameterized
 * per element instead of one fixed duration. Only ever rendered for
 * elements that actually have an `animationDuration` set -- elements
 * without one render through the plain, non-animated path in
 * CanvasRenderer, so existing saved frames are visually unchanged. */
export default function AnimatedCanvasElement({
  duration,
  style,
  className,
  children,
}: AnimatedCanvasElementProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
