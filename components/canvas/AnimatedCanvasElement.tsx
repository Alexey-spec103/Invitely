"use client";

import { motion, type MotionStyle } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/components/usePrefersReducedMotion";

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
  // This runs on every published guest site a host enabled it on -- unlike
  // RevealOnScroll (a site-chrome decision the host made), there's no host
  // control over whether an individual guest prefers reduced motion, so the
  // same `initial={false}` skip-the-transition pattern applies here too
  // (motion-audit, 2026-10-12).
  const reduceMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
