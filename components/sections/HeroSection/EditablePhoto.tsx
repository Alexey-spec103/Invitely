"use client";

import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./EditablePhoto.module.css";

interface EditablePhotoProps {
  src: string;
  className?: string;
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
export default function EditablePhoto({ src, className }: EditablePhotoProps) {
  const { editable } = useEditableField();

  if (!editable) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={className} />;
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className={className} data-field="photoUrl" />
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
