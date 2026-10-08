import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { Locale } from "@/lib/i18n/locales";

export type MapVariant = "embed-static" | "side-by-side-cards" | "minimal-list";

export interface MapVenue {
  name: string;
  address: string;
}

export interface MapSectionVariantProps {
  title: string;
  venues: MapVenue[];
  /** See HeroSection/types.ts's identical field for the convention. Field
   * keys for venue rows are "venues.<index>.<name|address>". */
  styleOverrides?: Record<string, TextStyleOverride>;
  /** A plain locale string, not the Dictionary object -- see
   * RsvpSection/types.ts's `locale` field for why. Only used for each
   * embedded map iframe's a11y `title` (never visible text). */
  locale: Locale;
}

export interface MapSectionProps extends MapSectionVariantProps {
  variant: MapVariant;
}

/** Host-editor audit finding: the first venue added defaults to `{ name:
 * "New venue", address: "" }` until the host fills in real details (see
 * SiteInlineEditor's "+ Add venue" handler) -- querying Google's embed API
 * with that near-empty text doesn't 404, it resolves to a globe-wide zoomed-
 * out view, which read as broken mid-setup rather than "not filled in yet."
 * `null` here means "don't render an iframe at all yet" -- every variant
 * shows a plain placeholder in its place instead. Gated on `address` alone:
 * a name with no address is still too vague for Maps to geocode usefully. */
export function mapEmbedSrc(venue: MapVenue): string | null {
  if (!venue.address.trim()) return null;
  const query = encodeURIComponent(`${venue.name}, ${venue.address}`);
  return `https://www.google.com/maps?q=${query}&output=embed`;
}
