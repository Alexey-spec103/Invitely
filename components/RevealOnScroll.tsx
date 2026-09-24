"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion } from "framer-motion";

interface RevealOnScrollProps {
  children: ReactNode;
  /** IntersectionObserver root, for revealing inside a capped-height,
   * internally-scrolling frame (e.g. the site constructor's own preview
   * pane) instead of the top-level document viewport.
   *
   * Deliberately NOT passed as framer-motion's own `whileInView`/`viewport.root`
   * prop -- that reads `root.current` inside an internal layout effect on the
   * *child* (this component's own `motion.div`), which in React's commit
   * order fires before the *ancestor* scroll-frame's own ref has attached
   * (layout effects and ref attachment both run bottom-up, so a descendant's
   * layout effect always precedes an ancestor host node's ref commit).
   * Confirmed live: with `viewport.root` wired directly, every section
   * stayed at opacity 0 even scrolled to the very bottom of the frame --
   * `root.current` was read as `null` on the one and only commit framer-
   * motion ever re-reads it on (its own `update()` only restarts the
   * observer if `viewport.root` changes *identity*, which a stable ref
   * object never does). A plain `useEffect` here instead -- passive effects
   * fire strictly after every ref in the whole tree, ancestors included, is
   * already attached -- reads `root.current` at a point where it's
   * guaranteed valid. */
  root?: RefObject<HTMLElement | null>;
}

export default function RevealOnScroll({ children, root }: RevealOnScrollProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <motion.div
      ref={targetRef}
      initial={{ opacity: 0, y: 24 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
