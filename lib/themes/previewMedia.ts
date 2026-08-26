import type { ThemeCategory } from "./types";

/**
 * Atmospheric detail photos (florals, textures, venues -- never a posed
 * "couple" photo, since that would misrepresent a specific real couple as
 * a generic example) for the theme gallery's card previews. Sourced from
 * Unsplash, whose license permits free commercial use with no attribution
 * required -- this is a legitimate stock-photo integration, not a copy of
 * any specific designer's copyrighted artwork. Two per category so cards
 * within the same category don't all show the identical photo.
 */
export const CATEGORY_PREVIEW_PHOTOS: Record<ThemeCategory, string[]> = {
  romantic: [
    "https://images.unsplash.com/photo-1511201173873-c327e63eb6c4",
    "https://images.unsplash.com/photo-1582794543462-0d7922e50cf5",
  ],
  modern: [
    "https://images.unsplash.com/photo-1483366774565-c783b9f70e2c",
    "https://images.unsplash.com/photo-1496865534669-25ec2a3a0fd3",
  ],
  botanical: [
    "https://images.unsplash.com/photo-1512716679859-da19b4af9c38",
    "https://images.unsplash.com/photo-1533038590840-1cde6e668a91",
  ],
  boho: [
    "https://images.unsplash.com/photo-1604304194650-3ba3cfa752fd",
    "https://images.unsplash.com/photo-1619422305894-dd096b3e6b98",
  ],
  luxury: [
    "https://images.unsplash.com/photo-1766393030762-0f1940c17548",
    "https://images.unsplash.com/photo-1783148877802-b120f8fde090",
  ],
  dark: [
    "https://images.unsplash.com/photo-1518343161123-c7e9ab4dc4da",
    "https://images.unsplash.com/photo-1447875569765-2b3db822bec9",
  ],
  coastal: [
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0",
    "https://images.unsplash.com/photo-1524946274118-e7680e33ccc5",
  ],
  vintage: [
    "https://images.unsplash.com/photo-1544576623-d817a825bc64",
    "https://images.unsplash.com/photo-1586685983546-0d25211d7166",
  ],
  minimal: [
    "https://images.unsplash.com/photo-1566041510394-cf7c8fe21800",
    "https://images.unsplash.com/photo-1551554781-c46200ea959d",
  ],
  rustic: [
    "https://images.unsplash.com/photo-1533155929419-7b6cb0b49ccb",
    "https://images.unsplash.com/photo-1586880043376-2b7bd270cd4b",
  ],
};

/** Rotating example couple names for card previews -- avoids every one of
 * 100 cards showing the identical "A & B" placeholder, which was the main
 * complaint driving this file's existence. Not tied to any real person. */
export const PREVIEW_NAME_PAIRS: [string, string][] = [
  ["Emma", "James"],
  ["Sofia", "Alex"],
  ["Anna", "Michael"],
  ["Olivia", "Daniel"],
  ["Mia", "Ethan"],
  ["Grace", "Noah"],
  ["Chloe", "Lucas"],
  ["Isabella", "William"],
  ["Charlotte", "Henry"],
  ["Amelia", "Leo"],
  ["Zoe", "Oliver"],
  ["Ruby", "Samuel"],
];

function stableIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

export type PreviewDateStyle = "long" | "compact" | "numeric" | "spelled";

/** Assigned by category, not per-theme -- a real designer varies date
 * typography by register (formal vs. casual), not randomly. Luxury/vintage/
 * dark read as more formal (spelled/compact-caps), modern/minimal read as
 * structured (numeric), everything else keeps the classic long form. */
const CATEGORY_DATE_STYLE: Record<ThemeCategory, PreviewDateStyle> = {
  romantic: "long",
  modern: "numeric",
  botanical: "long",
  boho: "long",
  luxury: "spelled",
  dark: "spelled",
  coastal: "long",
  rustic: "compact",
  vintage: "spelled",
  minimal: "numeric",
};

const ORDINAL_SUFFIX = (day: number) => {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export function formatPreviewDate(date: Date, style: PreviewDateStyle): string {
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const monthShort = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();

  switch (style) {
    case "long":
      return `${month} ${day}, ${year}`;
    case "numeric":
      return `${String(day).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${year}`;
    case "compact":
      return `${day} ${monthShort.toUpperCase()} ${year}`;
    case "spelled":
      return `THE ${day}${ORDINAL_SUFFIX(day)} OF ${month.toUpperCase()}`;
  }
}

/** Always a future date relative to whenever it's computed (client-side
 * "now"), not a fixed calendar date -- so a live countdown built from it
 * never shows "today" or a negative value, and the gallery never goes stale.
 * Offset (14-113 days out) is deterministic per theme so the same card
 * doesn't jump to a different date on every re-render. */
export function previewTargetDateFor(themeId: string): Date {
  const offsetDays = 14 + stableIndex(themeId, 100);
  const target = new Date();
  target.setHours(18, 0, 0, 0);
  target.setDate(target.getDate() + offsetDays);
  return target;
}

/** Mirrors the real public-site URL pattern (`/e/{slug}`) rather than a
 * fabricated custom domain -- shows exactly what the product actually
 * delivers by default, not an aspirational fake TLD. */
export function previewDateStyleFor(category: ThemeCategory): PreviewDateStyle {
  return CATEGORY_DATE_STYLE[category];
}

export function previewDomainFor(name1: string, name2: string): string {
  const slug = `${name1}-${name2}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `invitely.com/e/${slug}`;
}

/** Deterministic (not random) so the same theme always shows the same
 * photo/names on every render -- avoids a hydration mismatch between server
 * and client and avoids cards reshuffling every time the gallery re-filters. */
export function previewPhotoFor(themeId: string, category: ThemeCategory): string {
  const photos = CATEGORY_PREVIEW_PHOTOS[category];
  return photos[stableIndex(themeId, photos.length)];
}

export function previewNamesFor(themeId: string): [string, string] {
  return PREVIEW_NAME_PAIRS[stableIndex(themeId, PREVIEW_NAME_PAIRS.length)];
}
