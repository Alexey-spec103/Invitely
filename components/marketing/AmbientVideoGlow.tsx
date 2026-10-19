"use client";

import { useEffect, useRef } from "react";

interface AmbientVideoGlowProps {
  src: string;
  className?: string;
}

/** A soft, blurred, looping video used purely as ambient color+motion behind
 * real content (a phone mockup, a CTA) -- never a focal element itself, so
 * it never competes with the actual product screenshots already doing that
 * job elsewhere on this page.
 *
 * Researched the muted/loop/playsInline + JS-driven `.play()` pattern live
 * against Framer's and Apple's own hero videos (both skip the bare
 * `autoplay` attribute entirely -- `preload="none"`, play triggered by
 * script) rather than guessing: relying on the attribute alone is exactly
 * the kind of implementation that silently fails under stricter mobile
 * autoplay policies. `preload="metadata"` here (not "none") is a deliberate
 * deviation -- it guarantees a real first frame shows immediately for
 * prefers-reduced-motion visitors instead of a blank rectangle, at the cost
 * of a few KB rather than the full clip.
 *
 * Performance audit (2026-10-19), measured live via the Resource Timing
 * API on the homepage: calling `.play()` unconditionally on mount -- this
 * component's own previous behavior -- makes the browser abandon
 * "metadata"'s partial fetch and download the full clip immediately,
 * regardless of scroll position. Two instances mount on this page: the
 * hero's own (2.1MB, legitimately above the fold) and the final-CTA
 * section's (4.7MB, ~11,700px down the page -- confirmed live,
 * `getBoundingClientRect().top` far outside the viewport on load). Both
 * were downloading in full on every page load, the second one for almost
 * no visitor ever scrolling that far: 4.7MB of this page's measured 6.9MB
 * total transfer was exactly this one avoidable fetch. An
 * IntersectionObserver instead -- `.play()` only once the video is close
 * to entering the viewport, exactly the "about to matter" trigger this
 * comment already described as the correct pattern without ever
 * implementing it. rootMargin gives it a head start so playback has
 * already begun by the time it's actually visible, not a jarring freeze-
 * frame-then-play moment. */
export default function AmbientVideoGlow({ src, className }: AmbientVideoGlowProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const play = () => {
      void video.play().catch(() => {
        // Autoplay can still be refused by the browser/user settings even
        // muted -- the first frame (already loaded via preload="metadata")
        // stays visible as a static image, which is a fine fallback.
      });
    };

    if (typeof IntersectionObserver === "undefined") {
      // Old-browser fallback -- same unconditional behavior as before
      // rather than a decorative video never playing at all.
      play();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          play();
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
