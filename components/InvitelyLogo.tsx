/** dashboard-audit.md D7: a graphic mark next to the bare "Invitely" wordmark,
 * shared by the dashboard header and the marketing landing page (header +
 * footer) so the brand mark doesn't drift into two different icons. "Toast i"
 * from the logo-concepts review -- the whole glyph reshapes into a champagne
 * flute (bowl / stem / base) with three rising bubbles standing in for the
 * usual dot, so it reads as "celebration" generally rather than "wedding"
 * specifically. Self-contained tile (own rounded-square background) --
 * `app/icon.svg` is the same mark with the accent hard-coded (a browser tab
 * favicon renders outside this document's CSS, so it can't read `--dash-accent`). */
export default function InvitelyLogo({ className = "h-[22px] w-[22px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={`shrink-0 ${className}`}>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="var(--dash-accent)" />
      <path d="M16.6 15 C16.6 20.5 18.4 23 20 23 C21.6 23 23.4 20.5 23.4 15 Z" fill="#fff" />
      <rect x="19.3" y="23" width="1.4" height="5.5" fill="#fff" />
      <rect x="16.3" y="28.5" width="7.4" height="2.3" rx="1.15" fill="#fff" />
      <circle cx="20" cy="11" r="1" fill="#fff" />
      <circle cx="18.3" cy="8" r="0.8" fill="#fff" />
      <circle cx="21.2" cy="6" r="0.6" fill="#fff" />
    </svg>
  );
}
