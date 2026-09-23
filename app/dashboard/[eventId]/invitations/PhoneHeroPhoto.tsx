"use client";

/** Isolated client leaf for the one thing in InvitationsShowcase (a Server
 * Component) that needs a real event handler -- `onError` can't be passed
 * to a DOM element from a Server Component ("Event handlers cannot be
 * passed to Client Component props", confirmed live). A broken/unreachable
 * photo URL otherwise renders the browser's broken-image glyph full-bleed
 * behind the names; hiding the element on error matches the honest
 * no-photo fallback every other card in this file already has. */
export default function PhoneHeroPhoto({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}
