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
 * deviation -- Apple/Framer's players explicitly call `.load()` themselves
 * when a video is about to matter (e.g. scrolled into view); this component
 * has no such lazy-mount step, so "metadata" guarantees a real first frame
 * shows immediately for prefers-reduced-motion visitors instead of a blank
 * rectangle, at the cost of a few KB rather than the full clip. */
export default function AmbientVideoGlow({ src, className }: AmbientVideoGlowProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    void video.play().catch(() => {
      // Autoplay can still be refused by the browser/user settings even
      // muted -- the first frame (already loaded via preload="metadata")
      // stays visible as a static image, which is a fine fallback.
    });
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
