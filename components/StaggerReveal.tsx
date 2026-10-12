"use client";

import { Children, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, type Target } from "framer-motion";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

// performance-audit (2026-10-12): previously also animated filter:blur() for
// a soft-focus-in touch -- opacity/transform are compositor-only (the
// browser can animate them on the GPU without repainting), but filter is
// not, so a blurred region repaints every frame instead. This component
// mounts per-word/per-line across ~14 Hero variants plus every Letter
// section, all reveal-on-scroll -- on the lower-end mobile devices this
// product's actual guest audience (not just hosts) is likely to carry,
// several of these animating in close together during a fast scroll was a
// plausible jank source. Dropped the filter, kept the rest -- still reads
// as a real reveal, just compositor-cheap everywhere it's used.
const HIDDEN: Target = { opacity: 0, y: 8 };
const VISIBLE: Target = { opacity: 1, y: 0 };
// Spring, not a bare ease -- same enter recipe RevealOnScroll uses, `bounce: 0`
// keeps it production-subtle rather than reading as playful overshoot.
const ITEM_TRANSITION = { type: "spring" as const, duration: 0.5, bounce: 0 };

interface StaggerRevealProps {
  /** Each direct child becomes its own staggered enter item -- a handful of
   * short fragments (a name, a separator, a title, a paragraph) reads as a
   * cascade; a few dozen would read as flicker instead of motion. */
  children: ReactNode;
  /** Same non-document scroll root RevealOnScroll takes -- see that
   * component's own comment for why this can't be framer-motion's native
   * `whileInView`/`viewport.root`. */
  root?: RefObject<HTMLElement | null>;
  /** Seconds between each child's start. */
  staggerDelay?: number;
  /** Outer wrapper tag. "p" for an inline run of words that must wrap like
   * normal text (e.g. two names + a separator); "div" for a stack of
   * block-level fields. */
  as?: "p" | "div";
  /** Per-child wrapper tag. "span" for inline text fragments (paired with
   * `as="p"`); "div" for already block-level children (e.g. an `<h2>` or
   * `<p>` field) -- a `<span>` can't legally contain block content. */
  itemAs?: "span" | "div";
  className?: string;
}

/** Extends RevealOnScroll's single-block reveal with a staggered cascade
 * across a handful of children, for content specific enough to want more
 * than one uniform fade -- a couple's names entering word by word, or a
 * letter's title/body/signature settling in one after another instead of
 * as a single flat block. Reuses the same IntersectionObserver-on-a-ref
 * mechanism (see RevealOnScroll's comment for why not `whileInView`), so
 * this is meant to nest *inside* content a RevealOnScroll (or the
 * section-level wrap every section already gets) already surrounds --
 * not a replacement for it. */
export default function StaggerReveal({
  children,
  root,
  staggerDelay = 0.09,
  as = "div",
  itemAs = "div",
  className,
}: StaggerRevealProps) {
  const targetRef = useRef<HTMLElement | null>(null);
  const setTargetRef = (el: HTMLElement | null) => {
    targetRef.current = el;
  };
  const [isVisible, setIsVisible] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = targetRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root: root?.current ?? null, threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `root` is a stable ref object; its `.current` mutating isn't a dependency change worth re-running for.
  }, []);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: staggerDelay } },
  };

  const items = Children.toArray(children).map((child, index) =>
    itemAs === "span" ? (
      <motion.span
        key={index}
        variants={{ hidden: HIDDEN, visible: VISIBLE }}
        transition={ITEM_TRANSITION}
        style={{ display: "inline-block", maxWidth: "100%" }}
      >
        {child}
      </motion.span>
    ) : (
      <motion.div key={index} variants={{ hidden: HIDDEN, visible: VISIBLE }} transition={ITEM_TRANSITION}>
        {child}
      </motion.div>
    )
  );

  // `initial={false}` skips the enter transition altogether under reduced
  // motion -- children render directly at their final `visible` values on
  // first paint, same escape hatch as RevealOnScroll.
  const sharedProps = {
    ref: setTargetRef,
    className,
    initial: reduceMotion ? false : "hidden",
    animate: reduceMotion || isVisible ? "visible" : "hidden",
    variants: containerVariants,
  };

  if (as === "p") return <motion.p {...sharedProps}>{items}</motion.p>;
  return <motion.div {...sharedProps}>{items}</motion.div>;
}
