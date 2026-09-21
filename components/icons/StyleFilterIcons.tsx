/** dashboard-audit.md B8: weddingpost.ru draws its own small line-art glyph
 * for every entry in its style-filter sidebar (confirmed live at
 * /cabinet/style/variant/ -- one icon per category, ~20px, recoloring from
 * navy to coral via the same mechanism as the active/inactive pill state).
 * These mirror that per-entry-icon treatment for our merged Style list from
 * B7 (ThemeGallery.tsx's `combinedStyleEntries`): one icon per
 * `category`-kind entry and one per `layout`-kind entry. Unlike
 * `RailIcons.tsx` (always-colored, badge-backed, for a handful of permanent
 * nav items), these are plain monochrome strokes with no fill/background --
 * a repeating filter list of 30 needs to read as one quiet family, and
 * `currentColor` is what lets each icon pick up `.filterBtn`/`.filterActive`
 * text color for free instead of needing its own active-state styling.
 * Original line art, not a copy of weddingpost's own (never seen, and
 * wouldn't be ours to use). */

import type { ComponentType, ReactNode } from "react";
import type { ThemeCategory } from "@/lib/themes";

interface StyleIconProps {
  className?: string;
}

function IconFrame({ className, children }: StyleIconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// -- Category-kind entries (theme.category) ---------------------------------

export function RomanticStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M10 16.5c-3.6-2.4-6-4.7-6-7.4a3.3 3.3 0 0 1 6-1.9 3.3 3.3 0 0 1 6 1.9c0 2.7-2.4 5-6 7.4z" />
    </IconFrame>
  );
}

export function ModernStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <rect x="4" y="4" width="5" height="5" rx="0.8" />
      <rect x="11" y="4" width="5" height="5" rx="0.8" />
      <rect x="4" y="11" width="5" height="5" rx="0.8" />
      <rect x="11" y="11" width="5" height="5" rx="0.8" />
    </IconFrame>
  );
}

export function BotanicalStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M6 15c-1.2-4.8 1.2-9.2 8-10.5.9 6.8-2.2 10.6-8 10.5z" />
      <path d="M6.5 14.5c2-2.6 4-4.8 7.2-9.6" />
    </IconFrame>
  );
}

export function BohoStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="10" cy="10" r="3.2" />
      <path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.2 5.2l1.4 1.4M13.4 13.4l1.4 1.4M14.8 5.2l-1.4 1.4M6.6 13.4l-1.4 1.4" />
    </IconFrame>
  );
}

export function LuxuryStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M5 8l2.5-4h5L15 8l-5 8-5-8z" />
      <path d="M5 8h10M7.5 4l1 4-1 8M12.5 4l-1 4 1 8" />
    </IconFrame>
  );
}

export function DarkMoodyStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M12.5 4.2a6.3 6.3 0 1 0 3.3 8.9 5 5 0 0 1-3.3-8.9z" />
    </IconFrame>
  );
}

export function CoastalStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M3 8c1.3-1.3 2.7-1.3 4 0s2.7 1.3 4 0 2.7-1.3 4 0 2.7-1.3 4 0" />
      <path d="M3 13c1.3-1.3 2.7-1.3 4 0s2.7 1.3 4 0 2.7-1.3 4 0 2.7-1.3 4 0" />
    </IconFrame>
  );
}

export function RusticStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M10 17V6" />
      <path d="M10 6c-1.6-.4-2.6-1.4-2.6-2.6M10 6c1.6-.4 2.6-1.4 2.6-2.6M10 9c-1.6-.4-2.6-1.4-2.6-2.6M10 9c1.6-.4 2.6-1.4 2.6-2.6M10 12c-1.6-.4-2.6-1.4-2.6-2.6M10 12c1.6-.4 2.6-1.4 2.6-2.6" />
    </IconFrame>
  );
}

export function VintageStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="10" cy="11" r="5.5" />
      <path d="M10 11V7.8M10 11l2.4 1.4" />
      <path d="M8.3 3.2h3.4M10 3.2V5" />
    </IconFrame>
  );
}

export function MinimalStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="10" cy="10" r="4.2" />
    </IconFrame>
  );
}

// An irregular agate-slice silhouette with a wandering vein line through
// it -- distinct from LuxuryStyleIcon's symmetric faceted diamond above
// (that one reads as "cut gem," this one as "polished stone").
export function MarbleStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M10 3.2l4.6 2.3.8 5-2.6 4.3-5.6.8-3.6-3.6.4-5.4z" />
      <path d="M4.6 11.6c1.6-.6 2.4-1.8 2-3.2.5 1.2 1.7 1.7 3 1.3-.3 1.4.4 2.4 1.8 2.7" />
    </IconFrame>
  );
}

// A crescent moon with two small four-point stars -- distinct from
// DarkMoodyStyleIcon's plain crescent above (no stars there).
export function CosmicStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M11.8 4.5a5.6 5.6 0 1 0 2.9 7.9 4.4 4.4 0 0 1-2.9-7.9z" />
      <path d="M15.5 4.5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" />
      <path d="M5.5 13l.35.85.85.35-.85.35-.35.85-.35-.85-.85-.35.85-.35z" />
    </IconFrame>
  );
}

// A layered peony bloom -- concentric overlapping petal arcs around a
// center, distinct from RomanticStyleIcon's single simple heart above.
export function PeonyStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="10" cy="10" r="1.6" />
      <path d="M10 8.4a2.6 2.6 0 1 1 0 3.2M11.6 10a2.6 2.6 0 1 1-3.2 0M8.4 10a2.6 2.6 0 1 1 1.6-2.6M10 11.6a2.6 2.6 0 1 1 2.6 1.6" />
      <path d="M10 6.4a4.4 4.4 0 1 1 0 7.2M13.6 10a4.4 4.4 0 1 1-7.2 0" />
    </IconFrame>
  );
}

// A hanging wisteria/lavender stem -- a single vertical stalk with small
// alternating oval buds, distinct from RusticStyleIcon's symmetric
// wheat-head branch above (that one reads as grain, this one as a trailing
// flower spray).
export function ProvenceStyleIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M10 3.5v13" />
      <ellipse cx="8.6" cy="6.5" rx="1.1" ry="0.6" transform="rotate(-30 8.6 6.5)" />
      <ellipse cx="11.4" cy="8.2" rx="1.1" ry="0.6" transform="rotate(30 11.4 8.2)" />
      <ellipse cx="8.6" cy="9.9" rx="1.1" ry="0.6" transform="rotate(-30 8.6 9.9)" />
      <ellipse cx="11.4" cy="11.6" rx="1.1" ry="0.6" transform="rotate(30 11.4 11.6)" />
      <ellipse cx="8.6" cy="13.3" rx="1.1" ry="0.6" transform="rotate(-30 8.6 13.3)" />
    </IconFrame>
  );
}

// -- Layout-kind entries (layoutLabelFor) ------------------------------------

export function EditorialLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <rect x="4" y="4" width="12" height="12" rx="1" />
      <path d="M6.5 7h3M6.5 9.3h3M6.5 11.6h7M6.5 13.9h7" />
      <rect x="11" y="7" width="2.5" height="2.5" />
    </IconFrame>
  );
}

export function TypographyLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4.5 15L7.5 5h1L11.5 15M5.4 12h5.2" />
      <path d="M13 9.2c.4-.5 1-.8 1.7-.8 1.1 0 1.8.7 1.8 1.8v4.3M16.5 12.3c-2.6-.3-3.8.5-3.8 1.7 0 .8.6 1.3 1.5 1.3.9 0 1.8-.5 2.3-1.3" />
    </IconFrame>
  );
}

export function ArtDecoLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M10 17L4 8M10 17L7 6.5M10 17V3M10 17l3-10.5M10 17l6-9" />
    </IconFrame>
  );
}

export function MonogramLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="7.5" cy="10" r="4" />
      <circle cx="12.5" cy="10" r="4" />
    </IconFrame>
  );
}

export function HandLetteringLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4 14c2-6 4-8 6-6s0 6 2 6 2-4 4-6" />
    </IconFrame>
  );
}

export function LetterpressLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <rect x="5" y="4" width="10" height="7" rx="1" />
      <path d="M8 11v2.5M12 11v2.5" />
      <path d="M6.5 16.5h7" />
    </IconFrame>
  );
}

export function OrnamentalFrameLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <rect x="4" y="4" width="12" height="12" rx="1" />
      <path d="M4 7V4h3M13 4h3v3M16 13v3h-3M7 16H4v-3" />
    </IconFrame>
  );
}

export function ClassicLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4 7l4 3-4 3zM16 7l-4 3 4 3z" />
      <circle cx="10" cy="10" r="1.3" />
    </IconFrame>
  );
}

export function WatercolorLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M6 16l6-10 2 1-6 10z" />
      <circle cx="14.5" cy="5.5" r="1.3" />
      <circle cx="5" cy="17" r="0.8" />
    </IconFrame>
  );
}

export function LineArtLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4 14c1-3 2-3 3-1s2 2 3 0 1.5-4 3-4 2 3 3 1" />
    </IconFrame>
  );
}

export function CoastalMotifLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M10 16V9.5" />
      <path d="M10 9.5c0-3.5 2-5.5 5-5.5-.3 3.6-2.2 5.2-5 5.5zM10 9.5c0-3.5-2-5.5-5-5.5.3 3.6 2.2 5.2 5 5.5z" />
    </IconFrame>
  );
}

export function BotanicalLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4 16c3-5 5-8 5-12" />
      <circle cx="9.5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="9.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="6" cy="13" r="0.8" fill="currentColor" stroke="none" />
    </IconFrame>
  );
}

export function FolkOrnamentLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M10 4c1.4 1.4 1.4 3 0 4-1.4-1-1.4-2.6 0-4zM10 12c1.4 1.4 1.4 3 0 4-1.4-1-1.4-2.6 0-4zM4 10c1.4-1.4 3-1.4 4 0-1 1.4-2.6 1.4-4 0zM12 10c1.4-1.4 3-1.4 4 0-1 1.4-2.6 1.4-4 0z" />
      <circle cx="10" cy="10" r="1.2" fill="currentColor" stroke="none" />
    </IconFrame>
  );
}

export function CollageLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <rect x="4" y="4" width="8" height="8" rx="1" />
      <rect x="8.5" y="8.5" width="8" height="8" rx="1" />
    </IconFrame>
  );
}

export function GothicFrameLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M5 17V9a5 5 0 0 1 10 0v8" />
      <path d="M5 17h10" />
    </IconFrame>
  );
}

export function AtmosphericLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4 12c0-1.7 1.4-3 3-3 .3-2 2-3.5 4-3.5s3.7 1.5 4 3.5c1.6 0 3 1.3 3 3s-1.4 3-3 3H7c-1.6 0-3-1.3-3-3z" />
      <path d="M3.5 15.5h4M8.5 16.5h5M14.5 15.5h2.5" />
    </IconFrame>
  );
}

export function PostageStampLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <rect x="5" y="5" width="10" height="10" rx="0.5" strokeDasharray="1.6 1.4" />
      <circle cx="10" cy="10" r="2.2" />
    </IconFrame>
  );
}

export function CameoLocketLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <ellipse cx="10" cy="10" rx="4.5" ry="5.5" />
      <path d="M10 3.5V2M8 2h4" />
    </IconFrame>
  );
}

export function GridLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4 8h12M4 12h12M8 4v12M12 4v12" />
    </IconFrame>
  );
}

export function PhotoInvitationLayoutIcon({ className }: StyleIconProps) {
  return (
    <IconFrame className={className}>
      <rect x="4" y="5" width="12" height="10" rx="1" />
      <circle cx="8" cy="9" r="1.4" />
      <path d="M6 13l3-3 2 2 3-4 2 3" />
    </IconFrame>
  );
}

export const CATEGORY_STYLE_ICONS: Record<ThemeCategory, ComponentType<StyleIconProps>> = {
  romantic: RomanticStyleIcon,
  modern: ModernStyleIcon,
  botanical: BotanicalStyleIcon,
  boho: BohoStyleIcon,
  luxury: LuxuryStyleIcon,
  dark: DarkMoodyStyleIcon,
  coastal: CoastalStyleIcon,
  rustic: RusticStyleIcon,
  vintage: VintageStyleIcon,
  minimal: MinimalStyleIcon,
  marble: MarbleStyleIcon,
  cosmic: CosmicStyleIcon,
  peony: PeonyStyleIcon,
  provence: ProvenceStyleIcon,
};

/** Keyed by the exact label strings `layoutLabelFor` produces (see
 * `HERO_VARIANT_LAYOUT_LABEL` in `lib/themes/recommendedHeroVariant.ts`) --
 * not every label is guaranteed to have a theme behind it at any given
 * moment (a rarely-hashed variant like "Cameo Locket" can have a zero count),
 * so this covers the full label set the map can produce, not just whichever
 * ones happen to be present in `THEME_LAYOUTS` today. */
export const LAYOUT_STYLE_ICONS: Record<string, ComponentType<StyleIconProps>> = {
  Editorial: EditorialLayoutIcon,
  Typography: TypographyLayoutIcon,
  "Art Deco": ArtDecoLayoutIcon,
  Monogram: MonogramLayoutIcon,
  "Hand Lettering": HandLetteringLayoutIcon,
  Letterpress: LetterpressLayoutIcon,
  "Ornamental Frame": OrnamentalFrameLayoutIcon,
  Classic: ClassicLayoutIcon,
  Watercolor: WatercolorLayoutIcon,
  "Line Art": LineArtLayoutIcon,
  "Coastal Motif": CoastalMotifLayoutIcon,
  Botanical: BotanicalLayoutIcon,
  "Folk Ornament": FolkOrnamentLayoutIcon,
  Collage: CollageLayoutIcon,
  "Gothic Frame": GothicFrameLayoutIcon,
  Atmospheric: AtmosphericLayoutIcon,
  "Postage Stamp": PostageStampLayoutIcon,
  "Cameo Locket": CameoLocketLayoutIcon,
  Grid: GridLayoutIcon,
  "Photo Invitation": PhotoInvitationLayoutIcon,
};
