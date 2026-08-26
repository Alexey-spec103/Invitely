"use client";

import { useEffect, useState } from "react";
import styles from "./ScrollToNextSection.module.css";

/** A small floating "jump to the next section" button, fixed bottom-right
 * of the viewport throughout the scroll -- hides once the guest is close to
 * the bottom of the page, since there's nothing further to jump to. Finds
 * the next section by DOM position rather than a passed-in list, so it
 * stays correct regardless of section order/enabled state. */
export default function ScrollToNextSection() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const nearBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 120;
      setVisible(!nearBottom);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToNext = () => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[id^="section-"]'));
    const threshold = window.scrollY + 10;
    // getBoundingClientRect (not offsetTop) -- sections can sit inside
    // differently-positioned wrappers (e.g. the reveal-on-scroll animation
    // container), so offsetTop is relative to whichever ancestor happens to
    // be `position`-ed, not reliably the document.
    const next = sections.find(
      (section) => section.getBoundingClientRect().top + window.scrollY > threshold
    );
    if (next) {
      next.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToNext}
      aria-label="Scroll to next section"
      className={styles.button}
    >
      ↓
    </button>
  );
}
