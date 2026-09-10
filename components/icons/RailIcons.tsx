/** dashboard-audit.md B2: weddingpost.ru's own rail uses "иллюстрированная
 * цветная иконка" per item -- always its own color, illustrated rather than
 * a generic line glyph, regardless of active/inactive state (only the cell
 * background highlights on active; confirmed in the audit's own section 2.2).
 * These six replace the plain lucide glyphs DashboardNav used before, one
 * hand-drawn mark per section, each carrying a soft badge-circle in its own
 * accent hue so the rail reads as a colorful wedding-service menu rather
 * than a monochrome dev-panel icon set. Not a clone of weddingpost's actual
 * artwork (never seen, and wouldn't be ours to copy) -- an original
 * illustration in the same spirit. */

interface RailIconProps {
  className?: string;
}

export function StyleRailIcon({ className }: RailIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fb7185" fillOpacity="0.18" />
      <path
        d="M12 6.5l1.35 3.3 3.55.3-2.7 2.35.85 3.45L12 14.05 8.95 15.9l.85-3.45-2.7-2.35 3.55-.3L12 6.5z"
        fill="#fb7185"
      />
      <circle cx="17.5" cy="7" r="1.15" fill="#fb7185" />
    </svg>
  );
}

export function SiteRailIcon({ className }: RailIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#2dd4bf" fillOpacity="0.18" />
      <circle cx="12" cy="12" r="6" fill="#2dd4bf" fillOpacity="0.35" />
      <circle cx="12" cy="12" r="6" stroke="#2dd4bf" strokeWidth="1.3" />
      <path d="M6 12h12" stroke="#2dd4bf" strokeWidth="1.2" />
      <path d="M12 6c-2.1 2.1-2.1 9.9 0 12M12 6c2.1 2.1 2.1 9.9 0 12" stroke="#2dd4bf" strokeWidth="1.2" />
    </svg>
  );
}

export function PaperRailIcon({ className }: RailIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#f472b6" fillOpacity="0.18" />
      <path d="M7 6.5h10v11H7z" fill="#f472b6" fillOpacity="0.35" />
      <path d="M13.5 6.5v4l3.5-4z" fill="#f472b6" />
      <path d="M9 12.2h6M9 14.6h4" stroke="#f472b6" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function GuestsRailIcon({ className }: RailIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#a78bfa" fillOpacity="0.18" />
      <circle cx="9.3" cy="9.3" r="2.3" fill="#a78bfa" />
      <path d="M4.6 17.4c0-2.55 2.1-4.2 4.7-4.2s4.7 1.65 4.7 4.2" fill="#a78bfa" fillOpacity="0.55" />
      <circle cx="15.1" cy="8.6" r="1.85" fill="#a78bfa" fillOpacity="0.55" />
      <path d="M13.6 13.9c2.2.35 3.8 1.85 3.8 3.9" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function InvitationsRailIcon({ className }: RailIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fbbf24" fillOpacity="0.18" />
      <rect x="5" y="7.5" width="14" height="10" rx="1.6" fill="#fbbf24" fillOpacity="0.35" />
      <path d="M5.4 8.1L12 13l6.6-4.9" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path
        d="M12 11.1c-.7-.85-2-.7-2 .35 0 .8.9 1.35 2 2.1 1.1-.75 2-1.3 2-2.1 0-1.05-1.3-1.2-2-.35z"
        fill="#fbbf24"
      />
    </svg>
  );
}

export function BanquetRailIcon({ className }: RailIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#818cf8" fillOpacity="0.18" />
      <circle cx="12" cy="12" r="5.6" fill="#818cf8" fillOpacity="0.3" />
      <circle cx="12" cy="12" r="5.6" stroke="#818cf8" strokeWidth="1.2" />
      <path d="M8.6 6.8v3.6M7.6 6.8v3.6c0 .75.45 1.2 1 1.2s1-.45 1-1.2V6.8M8.6 11.6v6.6" stroke="#818cf8" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.4 6.8c-.75 0-1.2.7-1.2 1.6s.45 1.6 1.2 1.6v8.4" stroke="#818cf8" strokeWidth="1.05" strokeLinecap="round" fill="none" />
    </svg>
  );
}
