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
 * URL. */
function buildResponsiveProps(src: string): { srcSet?: string; sizes?: string } {
  const match = UNSPLASH_WIDTH_PATTERN.exec(src);
  if (!src.includes("images.unsplash.com") || !match) return {};
  const requestedWidth = Number(match[2]);
  const widths = SRCSET_CANDIDATE_WIDTHS.filter((w) => w <= requestedWidth);
  if (requestedWidth && !widths.includes(requestedWidth)) widths.push(requestedWidth);
  if (widths.length < 2) return {};
  const srcSet = widths
    .map((w) => `${src.replace(UNSPLASH_WIDTH_PATTERN, `$1w=${w}`)} ${w}w`)
    .join(", ");
  // Every Hero variant is either full-bleed or a smaller framed/locket
  // photo within a full-width section -- 100vw is the conservative, always-
  // correct upper bound rather than tuning a sizes value per variant.
  return { srcSet, sizes: "100vw" };
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
export default function EditablePhoto({ src, className, alt = "" }: EditablePhotoProps) {
  const { editable } = useEditableField();
  const responsive = buildResponsiveProps(src);

  if (!editable) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} {...responsive} />;
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={className} data-field="photoUrl" {...responsive} />
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
