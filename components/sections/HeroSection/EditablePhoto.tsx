"use client";

import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./EditablePhoto.module.css";

interface EditablePhotoProps {
  src: string;
  className?: string;
  /** Descriptive alt text -- the couple's names, e.g. "Claire & Nathaniel".
   * Optional only because a couple of call sites render this before names
   * are guaranteed non-empty; falls back to "" (decorative) rather than a
   * hardcoded placeholder when omitted. */
  alt?: string;
  /** Performance audit (2026-10-19) follow-up: overrides the default
   * `sizes` guess (see buildResponsiveProps's own comment on why that
   * default changed) for the one variant that's actually full-bleed.
   * PhotoFullBleed.tsx is the only current caller. */
  sizes?: string;
}

const UNSPLASH_WIDTH_PATTERN = /([?&])w=(\d+)/;
/** Narrower than the source width so every entry is a real downscale, never
 * an upscale past what the caller actually requested (e.g. a 500w marketing
 * thumbnail never gets offered an 800w candidate it never needs). */
const SRCSET_CANDIDATE_WIDTHS = [480, 800, 1200, 1600];

/** 2026-10-09 performance audit: `/preview/[themeId]` requests a flat
 * `w=1600` Unsplash image regardless of viewport -- ~5x the pixels an
 * actual 375px-wide phone screen needs for this same photo. Every Hero
 * photo ultimately renders through this one component, so deriving a
 * `srcSet` here (rather than threading a second prop through HeroSection
 * and all 24 variants) fixes every current and future over-sized call site
 * at once. Unsplash-specific: its own `w=` query param is the one already-
 * established resizing convention this codebase uses elsewhere (see
 * ThemeGallery/HeroPhoneShowcase/SiteOrPaperSection, all `?w=500&q=70...`).
 * A `src` that isn't an already-tuned `?w=N&...` Unsplash URL (a Supabase
 * Storage upload, which has its own 1400px upload-time resize cap, or any
 * other source) renders exactly as before -- no behavior change, since
 * there's no safe generic way to derive sibling widths for an arbitrary
 * URL.
 *
 * Performance audit (2026-10-19) follow-up: the original `sizes: "100vw"`
 * default here was wrong for the common case, not just imprecise for it --
 * measured live on /preview/romantic-rosewater, a photo displayed at
 * 336x448 CSS px still fetched the 1600w candidate, a ~5x over-fetch,
 * because `sizes="100vw"` tells the browser the image might need the full
 * viewport width, so it reaches for the largest candidate regardless of
 * the real display size. Checked every one of the 24 Hero variants' own
 * `.photo` wrapper CSS (`.medallion`/`.photoFrame`/`.photoCell`/
 * `.photoPanel`/etc.) -- 23 of 24 cap the photo well under 352px even at
 * desktop widths (a locket/medallion/framed treatment, not a background);
 * only PhotoFullBleed.tsx genuinely renders edge-to-edge and passes its
 * own `sizes="100vw"` override below. 400px covers the largest of the 23
 * with margin; the mobile fallback (50vw) is still a large overestimate
 * for a ~100-200px medallion on a typical phone, but a safe one -- sizes
 * is a browser hint, not a hard clamp, and erring wide costs bytes, erring
 * narrow costs visible blur. */
function buildResponsiveProps(src: string, sizes?: string): { srcSet?: string; sizes?: string } {
  const match = UNSPLASH_WIDTH_PATTERN.exec(src);
  if (!src.includes("images.unsplash.com") || !match) return {};
  const requestedWidth = Number(match[2]);
  const widths = SRCSET_CANDIDATE_WIDTHS.filter((w) => w <= requestedWidth);
  if (requestedWidth && !widths.includes(requestedWidth)) widths.push(requestedWidth);
  if (widths.length < 2) return {};
  const srcSet = widths
    .map((w) => `${src.replace(UNSPLASH_WIDTH_PATTERN, `$1w=${w}`)} ${w}w`)
    .join(", ");
  return { srcSet, sizes: sizes ?? "(min-width: 768px) 400px, 50vw" };
}

/** Every Hero photo variant rendered a bare `<img>` -- the only way to
 * actually change or remove it lived in PhotoDropzone, rendered well below
 * the live preview and visually disconnected from the photo itself. A host
 * expects the same "click the thing you see" affordance every text field
 * already has (EditableText), tries it on the photo, finds nothing -- the
 * "не получается поменять" (can't manage to change it) report this fixes.
 *
 * Renders as SIBLINGS, not a wrapping div: every one of the 8 variants that
 * use this already wraps its own `<img>` in an immediate positioned parent
 * (`.stage`, `.locket`, `.photoCol`, `.section` itself, etc. -- each already
 * absolutely-positions its own decorative siblings like `.frame`/`.ring`/
 * `.overlay` against that same parent), so the corner badge below just
 * joins that existing positioning context instead of risking a new wrapper
 * breaking any variant's own absolute/percentage sizing.
 *
 * `data-field="photoUrl"` also makes the existing Editable Blocks sidebar
 * row's scrollToField(...) call actually find something to land on inside
 * the Hero preview -- no element carried that attribute before, so that
 * row silently scrolled nowhere.
 *
 * On the public site (no EditableFieldProvider, `editable` is false) this
 * renders as a plain `<img>` -- zero extra DOM/behavior, matching every
 * other EditableText-based field's public/editor split. */
export default function EditablePhoto({ src, className, alt = "", sizes }: EditablePhotoProps) {
  const { editable } = useEditableField();
  const responsive = buildResponsiveProps(src, sizes);

  // 2026-10-16 performance audit: this is the LCP candidate on both the
  // marketing landing page's HeroPhoneShowcase mockup and every published
  // guest site's own Hero -- the single most-visited unauthenticated path
  // in the app. No loading/fetchPriority hint meant it competed at default
  // priority against the font-preload/video/JS already on the critical
  // path (see app/layout.tsx's own 2026-10-16 note). `loading="eager"` is
  // already the img default, so only fetchPriority is new here.
  if (!editable) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} fetchPriority="high" {...responsive} />;
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={className} data-field="photoUrl" fetchPriority="high" {...responsive} />
      <button
        type="button"
        className={styles.editBadge}
        onClick={(event) => {
          event.stopPropagation();
          document
            .getElementById("hero-photo-controls")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.icon}>
          <path
            d="M13.5 3.5 16.5 6.5 7 16H4V13L13.5 3.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
        <span>Change photo</span>
      </button>
    </>
  );
}
