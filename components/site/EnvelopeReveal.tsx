"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Theme } from "@/lib/themes/types";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./EnvelopeReveal.module.css";

interface EnvelopeRevealProps {
  eventId: string;
  theme: Theme;
  names: string[];
  eventDate: string;
  monogramInitials?: string;
  guestName?: string;
  locale: Locale;
}

// Same local derivation as MonogramCenter/MonogramCrest -- no shared helper
// exists yet for this, and three near-identical copies already live in
// HeroSection variants, so a fourth keeps the pattern rather than forcing a
// premature shared abstraction.
function getInitials(names: string[]): string {
  return names
    .map((name) => name.trim().charAt(0))
    .filter(Boolean)
    .join("")
    .toUpperCase();
}

const AUTO_OPEN_DELAY_MS = 4500;
const OPEN_ANIMATION_MS = 900;

/** A brief, skippable "open the envelope" moment shown once per browser
 * before a guest's first view of the published site -- an honest riff on
 * paper-invitation ceremony, not a copy of any specific product's take on
 * it. Purely a client-side overlay on top of the already-rendered page: a
 * crawler or a no-JS visitor sees the real site immediately, and this only
 * ever adds a few seconds of delight on top for everyone else. */
export default function EnvelopeReveal({
  eventId,
  theme,
  names,
  eventDate,
  monogramInitials,
  guestName,
  locale,
}: EnvelopeRevealProps) {
  const dict = getDictionary(locale);
  const storageKey = `invitely:envelopeOpened:${eventId}`;
  const [visible, setVisible] = useState(true);
  const [opening, setOpening] = useState(false);
  const reduceMotion = useReducedMotion();
  const autoOpenRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const envelopeButtonRef = useRef<HTMLDivElement | null>(null);

  // The server always renders "closed" (it has no way to know whether this
  // guest has already seen it) -- this runs before the browser paints so a
  // returning visitor never sees a flash of the envelope before it vanishes.
  useLayoutEffect(() => {
    try {
      if (localStorage.getItem(storageKey) || reduceMotion) {
        // Deliberately synchronous and pre-paint (useLayoutEffect, not
        // useEffect) -- this is a one-time read of an external source
        // (localStorage) to correct SSR's necessarily-wrong initial guess,
        // not the derived-state anti-pattern this lint rule targets.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(false);
      }
    } catch {
      // Private-browsing/storage-restricted context: falls through and
      // simply shows once, same trade-off FirstVisitTour already accepts.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Accessibility audit (2026-10-22): nothing moved focus here before --
    // a keyboard user landed on <body> with no indication the envelope was
    // even the thing to interact with (confirmed live: the browser's own
    // default first-Tab behavior is inconsistent, body/document-level, not
    // this element specifically). This doesn't fix the deeper gap (the real
    // page underneath is still keyboard-reachable while this overlay is up
    // -- flagged separately, it needs either restructuring the page around
    // a shared inert/aria-hidden toggle or a precise DOM walk that risks
    // catching unrelated portaled UI, not a safe drop-in here) but it does
    // make the one control this component actually owns reachable immediately.
    envelopeButtonRef.current?.focus();
    autoOpenRef.current = setTimeout(open, AUTO_OPEN_DELAY_MS);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (autoOpenRef.current) clearTimeout(autoOpenRef.current);
      if (closeRef.current) clearTimeout(closeRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function open() {
    setOpening((already) => {
      if (already) return already;
      if (autoOpenRef.current) clearTimeout(autoOpenRef.current);
      closeRef.current = setTimeout(
        () => {
          setVisible(false);
          try {
            localStorage.setItem(storageKey, "1");
          } catch {
            // Non-fatal -- worst case the envelope shows again next visit.
          }
        },
        reduceMotion ? 0 : OPEN_ANIMATION_MS
      );
      return true;
    });
  }

  if (!visible) return null;

  const initials = monogramInitials?.trim() || getInitials(names);
  const coupleLabel = names.filter(Boolean).join(" & ");
  const duration = reduceMotion ? 0 : undefined;

  return (
    <>
      {/* No-JS visitors can't tap or trigger the auto-open timer -- hide the
          overlay outright so they land straight on the real site. */}
      <noscript>
        <style>{`.${styles.overlay}{display:none}`}</style>
      </noscript>
      <motion.div
        className={styles.overlay}
        style={theme.vars as CSSProperties}
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration, delay: opening ? (reduceMotion ? 0 : 0.4) : 0, ease: "easeOut" }}
        // Accessibility audit (2026-10-22): no role/aria-modal at all before
        // -- a screen reader landing here had no way to know this was a
        // distinct, dismissable layer sitting on top of the real page
        // (WCAG 4.1.2). aria-modal is a hint, not an enforcement (see the
        // focus() comment above for the real gap this doesn't close).
        role="dialog"
        aria-modal="true"
        aria-label={dict.envelopeReveal.openInvitation(coupleLabel)}
      >
        <div
          ref={envelopeButtonRef}
          className={styles.envelope}
          style={{ pointerEvents: opening ? "none" : undefined }}
          role="button"
          tabIndex={0}
          aria-label={dict.envelopeReveal.openInvitation(coupleLabel)}
          onClick={open}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              open();
            }
          }}
        >
          <span className={styles.body} aria-hidden="true" />
          <motion.span
            className={styles.flap}
            aria-hidden="true"
            animate={opening ? { rotateX: 165 } : { rotateX: 0 }}
            // motion-audit 2026-10-21: this is the one physical gesture in
            // the whole reveal -- the flap actually swinging open -- and a
            // flat `easeIn` reads as the envelope being yanked rather than
            // opened. A spring (`bounce: 0`, Jakub's production default)
            // gives the same no-overshoot settle but with real deceleration
            // weight, which a once-per-browser moment like this one can
            // afford to spend a little polish on.
            transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.5, bounce: 0 }}
          />
          <motion.span
            className={styles.seal}
            aria-hidden="true"
            animate={opening ? { scale: 0.4, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
          >
            {initials}
          </motion.span>
        </div>
        <div className={styles.hints} data-opening={opening || undefined}>
          <p className={styles.coupleLine}>
            {coupleLabel}
            {coupleLabel && eventDate ? " · " : ""}
            {eventDate}
          </p>
          {guestName && <p className={styles.guestLine}>{dict.envelopeReveal.invitationFor(guestName)}</p>}
          <p className={styles.hint}>{dict.envelopeReveal.tapToOpen}</p>
        </div>
      </motion.div>
    </>
  );
}
