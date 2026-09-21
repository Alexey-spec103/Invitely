import type { ThemeCategory, ThemeSeason } from "./types";

/**
 * Atmospheric detail photos (florals, textures, venues -- never a posed
 * "couple" photo, since that would misrepresent a specific real couple as
 * a generic example) for the theme gallery's card previews. Sourced from
 * Unsplash, whose license permits free commercial use with no attribution
 * required -- this is a legitimate stock-photo integration, not a copy of
 * any specific designer's copyrighted artwork.
 *
 * One photo per theme (not per category): the audit that drove this file
 * (docs/research/landing-audit.md, priority 12) caught the same barn photo
 * used on both "Wheatfield" and "Forest Cabin", and a beach aerial repeated
 * across two neighboring cards -- a direct consequence of the old 2-photos-
 * per-category pool being hashed across all 10 themes in that category.
 * Keyed by theme id (same pattern as `DEMO_NAMES` below) so every one of the
 * 100 themes gets its own distinct asset, chosen to fit that theme's name
 * and register where a fitting photo exists (e.g. "Barnwood" actually shows
 * a barn, "Postcard" actually shows a map).
 */
const THEME_PREVIEW_PHOTOS: Record<string, string> = {
  // Romantic
  "champagne-rose": "https://images.unsplash.com/photo-1511201173873-c327e63eb6c4",
  "romantic-antique-rose": "https://images.unsplash.com/photo-1582794543462-0d7922e50cf5",
  "romantic-blush": "https://images.unsplash.com/photo-1625680613227-4537c26f5d82",
  "romantic-blush-gold": "https://images.unsplash.com/photo-1773370812539-7ae26589d019",
  "romantic-champagne-blush": "https://images.unsplash.com/photo-1647296020397-8ef9f36afe99",
  "romantic-cherry-blossom": "https://images.unsplash.com/photo-1773005695201-68b25ae975c0",
  "romantic-garden-party": "https://images.unsplash.com/photo-1781090876896-2dd07110eb55",
  "romantic-ivory-lace": "https://images.unsplash.com/photo-1758705477576-8783430d55b6",
  "romantic-peony": "https://images.unsplash.com/photo-1773370812331-4e534dcf0ce1",
  "romantic-rosewater": "https://images.unsplash.com/photo-1759955903787-08b20dd8a925",

  // Modern
  "modern-blush-mono": "https://images.unsplash.com/photo-1483366774565-c783b9f70e2c",
  "modern-charcoal-blush": "https://images.unsplash.com/photo-1496865534669-25ec2a3a0fd3",
  "modern-cobalt": "https://images.unsplash.com/photo-1531591022136-eb8b0da1e6d0",
  "modern-coral-pop": "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
  "modern-graphite-teal": "https://images.unsplash.com/photo-1467154243382-ebe2c7d14fef",
  "modern-ivory-noir": "https://images.unsplash.com/photo-1613484259733-383234e8e8af",
  "modern-lilac-grid": "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a",
  "modern-sage-grid": "https://images.unsplash.com/photo-1460574283810-2aab119d8511",
  "modern-slate-amber": "https://images.unsplash.com/photo-1516730670158-8c52cb740fcf",
  "modern-terracotta-grid": "https://images.unsplash.com/photo-1564081727837-1ab9d67c41f9",

  // Botanical
  "botanical-cherry-bloom": "https://images.unsplash.com/photo-1512716679859-da19b4af9c38",
  "botanical-eucalyptus": "https://images.unsplash.com/photo-1533038590840-1cde6e668a91",
  "botanical-fern": "https://images.unsplash.com/photo-1611255550543-b5ecb01dfddc",
  "botanical-ivy-manor": "https://images.unsplash.com/photo-1466781783364-36c955e42a7f",
  "botanical-lavender-sprig": "https://images.unsplash.com/photo-1541437748616-60715173b70e",
  "botanical-moss": "https://images.unsplash.com/photo-1602229262754-3a232d284c22",
  "botanical-olive-branch": "https://images.unsplash.com/photo-1542728928-ee495082a3c6",
  "botanical-sage": "https://images.unsplash.com/photo-1521571086300-579bd981bbb6",
  "botanical-wildflower": "https://images.unsplash.com/photo-1553447974-62ec8ac208b6",
  "emerald-grove": "https://images.unsplash.com/photo-1668119207137-ed58653f992d",

  // Boho
  "boho-desert-clay": "https://images.unsplash.com/photo-1604304194650-3ba3cfa752fd",
  "boho-dusty-rose-macrame": "https://images.unsplash.com/photo-1621023286945-b8bf1d19f583",
  "boho-earthen-clay": "https://images.unsplash.com/photo-1619422305894-dd096b3e6b98",
  "boho-indigo-dye": "https://images.unsplash.com/photo-1726206916341-4f638366c2ed",
  "boho-lavender-fields": "https://images.unsplash.com/photo-1595595175455-740365521cd3",
  "boho-marigold-festival": "https://images.unsplash.com/photo-1752568583323-92145f90e6a8",
  "boho-sunset-rust": "https://images.unsplash.com/photo-1773736620892-52694acc18b0",
  "boho-terracotta": "https://images.unsplash.com/photo-1759496330594-f06bba028371",
  "boho-turquoise-tribal": "https://images.unsplash.com/photo-1763639204536-7663f0f1487b",
  "sage-and-clay": "https://images.unsplash.com/photo-1622787206647-61bb775901e1",

  // Luxury
  "burgundy-velvet": "https://images.unsplash.com/photo-1528459105426-b9548367069b",
  "gilded-ivory": "https://images.unsplash.com/photo-1783148877802-b120f8fde090",
  "luxury-black-diamond": "https://images.unsplash.com/photo-1712314947761-a8d718bd8c32",
  "luxury-champagne-pearl": "https://images.unsplash.com/photo-1769812343385-8048c47d9667",
  "luxury-emerald-gold": "https://images.unsplash.com/photo-1787089880833-816a9226194f",
  "luxury-ivory-platinum": "https://images.unsplash.com/photo-1635341109197-92a35fd98a77",
  "luxury-obsidian-copper": "https://images.unsplash.com/photo-1670529776286-f426fb7ba42c",
  "luxury-rose-gold": "https://images.unsplash.com/photo-1772127822552-ce9ef537bdcf",
  "luxury-sapphire-silver": "https://images.unsplash.com/photo-1635341108990-9201f2f48625",
  "regal-navy-gold": "https://images.unsplash.com/photo-1769812344142-00c7f6584885",

  // Dark
  "art-deco-noir": "https://images.unsplash.com/photo-1518343161123-c7e9ab4dc4da",
  "dark-crimson-noir": "https://images.unsplash.com/photo-1447875569765-2b3db822bec9",
  "dark-espresso-gold": "https://images.unsplash.com/photo-1590190537798-4db559287bba",
  "dark-forest-noir": "https://images.unsplash.com/photo-1506439577363-e2f85eb9aab8",
  "dark-midnight-teal": "https://images.unsplash.com/photo-1742809888743-07c1cc5af2b0",
  "dark-onyx-rose": "https://images.unsplash.com/photo-1518528802892-ec2191995c99",
  "dark-plum-velvet": "https://images.unsplash.com/photo-1605093659627-4d468d4c3ec7",
  "dark-storm-silver": "https://images.unsplash.com/photo-1507348762124-e7e0afcc0943",
  "dark-wine-noir": "https://images.unsplash.com/photo-1501471984908-815b996862f4",
  "editorial-noir": "https://images.unsplash.com/photo-1445383574278-925ca2b50058",

  // Coastal
  "coastal-azure-horizon": "https://images.unsplash.com/photo-1505142468610-359e7d316be0",
  "coastal-breeze": "https://images.unsplash.com/photo-1524946274118-e7680e33ccc5",
  "coastal-driftwood": "https://images.unsplash.com/photo-1666378190928-d1b745ef613f",
  "coastal-harbor-blue": "https://images.unsplash.com/photo-1662291384569-7aee95de3552",
  "coastal-linen": "https://images.unsplash.com/photo-1694215602230-480eb66b6abe",
  "coastal-mist-grey": "https://images.unsplash.com/photo-1635923954923-37ff3c7a01b0",
  "coastal-navy-sail": "https://images.unsplash.com/photo-1654306819056-f70266a52a80",
  "coastal-sand-dune": "https://images.unsplash.com/photo-1638718172993-36378902520d",
  "coastal-seafoam-breeze": "https://images.unsplash.com/photo-1707007730851-c53cc2879f00",
  "coastal-shell-pink": "https://images.unsplash.com/photo-1733949106698-b667f273afdb",

  // Rustic -- Barnwood, Wheatfield, and Forest Cabin each get a distinct
  // photo (the exact three cards the audit's screenshot caught sharing
  // assets), not the old shared 2-photo pool.
  "rustic-barnwood": "https://images.unsplash.com/photo-1778902378123-9a25f459203f",
  "rustic-copper-oak": "https://images.unsplash.com/photo-1533155929419-7b6cb0b49ccb",
  "rustic-cornflower-farm": "https://images.unsplash.com/photo-1599108689896-3f7c2631b0c2",
  "rustic-cranberry-harvest": "https://images.unsplash.com/photo-1761446245320-0748834214e9",
  "rustic-forest-cabin": "https://images.unsplash.com/photo-1600468975151-b6d0d83ea88e",
  "rustic-honey-hive": "https://images.unsplash.com/photo-1586880043376-2b7bd270cd4b",
  "rustic-olive-grove": "https://images.unsplash.com/photo-1641143979455-84f9d1f7b784",
  "rustic-sunflower-field": "https://images.unsplash.com/photo-1785895050435-4e4b7e9eb50c",
  "rustic-terracotta-pot": "https://images.unsplash.com/photo-1741299965071-6901956d8dac",
  "rustic-wheatfield": "https://images.unsplash.com/photo-1729711143849-fa9e23ea0e46",

  // Vintage
  "vintage-amber-glass": "https://images.unsplash.com/photo-1544576623-d817a825bc64",
  "vintage-dusty-plum": "https://images.unsplash.com/photo-1586685983546-0d25211d7166",
  "vintage-forest-emerald": "https://images.unsplash.com/photo-1519972064555-542444e71b54",
  "vintage-lilac-parlor": "https://images.unsplash.com/photo-1755540735819-107733f0be49",
  "vintage-mint-parlor": "https://images.unsplash.com/photo-1538645731800-4640c639bba7",
  "vintage-postcard": "https://images.unsplash.com/photo-1520299607509-dcd935f9a839",
  "vintage-powder-blue": "https://images.unsplash.com/photo-1706790608211-4c03fd4f4d33",
  "vintage-rosewood": "https://images.unsplash.com/photo-1763030861291-b7e65ae261c9",
  "vintage-sepia-lace": "https://images.unsplash.com/photo-1648717008621-ee7e6acfe270",
  "vintage-tobacco-leaf": "https://images.unsplash.com/photo-1532153259564-a5f24f261f51",

  // Minimal
  "dusty-blue-winter": "https://images.unsplash.com/photo-1566041510394-cf7c8fe21800",
  "minimal-blue-grey": "https://images.unsplash.com/photo-1525468568166-6f2cd17c7ec9",
  "minimal-clay-line": "https://images.unsplash.com/photo-1636477889313-a8f8e5f0779a",
  "minimal-ink": "https://images.unsplash.com/photo-1712730324756-e4879e9c9b11",
  "minimal-porcelain": "https://images.unsplash.com/photo-1533628635777-112b2239b1c7",
  "minimal-sage-line": "https://images.unsplash.com/photo-1551554781-c46200ea959d",
  "minimal-stone": "https://images.unsplash.com/photo-1712730327526-ca0a8dab0073",
  "minimal-taupe": "https://images.unsplash.com/photo-1616980540857-80cd9b1276c8",
  "modern-mono": "https://images.unsplash.com/photo-1575255597430-eba71bc85bc9",
  "nordic-minimal": "https://images.unsplash.com/photo-1520420253244-9ff6536abf60",
};

/** Fallback only, for a theme id not (yet) listed in `THEME_PREVIEW_PHOTOS`
 * above (e.g. a newly added theme) -- mirrors the fallback pattern already
 * used by `previewNamesFor`/`PREVIEW_NAME_PAIRS`. Two photos per category is
 * still an improvement over showing the same single photo theme-wide. */
const CATEGORY_PREVIEW_PHOTOS_FALLBACK: Record<ThemeCategory, string[]> = {
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
    "https://images.unsplash.com/photo-1528459105426-b9548367069b",
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
  // Reuses luxury's own fallback pair rather than guessing new Unsplash
  // ids -- both categories read as elegant/refined, and these are already
  // confirmed-working URLs.
  marble: [
    "https://images.unsplash.com/photo-1528459105426-b9548367069b",
    "https://images.unsplash.com/photo-1783148877802-b120f8fde090",
  ],
  // Reuses dark's own fallback pair -- cosmic's palette is night-sky/dark
  // like dark's, and these are already confirmed-working URLs.
  cosmic: [
    "https://images.unsplash.com/photo-1518343161123-c7e9ab4dc4da",
    "https://images.unsplash.com/photo-1447875569765-2b3db822bec9",
  ],
  // Reuses romantic's own fallback pair -- peony is a floral-romantic mood,
  // and these are already confirmed-working URLs.
  peony: [
    "https://images.unsplash.com/photo-1511201173873-c327e63eb6c4",
    "https://images.unsplash.com/photo-1582794543462-0d7922e50cf5",
  ],
  // Reuses botanical's own fallback pair -- provence is a botanical/
  // countryside mood, and these are already confirmed-working URLs.
  provence: [
    "https://images.unsplash.com/photo-1512716679859-da19b4af9c38",
    "https://images.unsplash.com/photo-1533038590840-1cde6e668a91",
  ],
};

/** Rotating example couple names for card previews -- fallback only, used
 * when a theme id isn't (yet) in `DEMO_NAMES` below. Not tied to any real
 * person. */
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

/** One hand-picked couple per theme, chosen to fit that specific theme's
 * register (soft/classic for Romantic, dramatic for Dark, antique for
 * Vintage, etc.) rather than a single shared pool hashed across all 100
 * themes regardless of mood. Keyed by theme id so it's a direct lookup, not
 * another hash -- `previewNamesFor` falls back to the old shared pool for
 * any theme id not listed here (e.g. a newly added theme). */
const DEMO_NAMES: Record<string, [string, string]> = {
  // Romantic -- soft, classic, timeless.
  "champagne-rose": ["Sophie", "Julian"],
  "romantic-antique-rose": ["Eleanor", "Frederick"],
  "romantic-blush": ["Claire", "Nathaniel"],
  "romantic-blush-gold": ["Isabelle", "Alexander"],
  "romantic-champagne-blush": ["Adelaide", "Sebastian"],
  "romantic-cherry-blossom": ["Marguerite", "Etienne"],
  "romantic-garden-party": ["Beatrice", "Oliver"],
  "romantic-ivory-lace": ["Genevieve", "Edmund"],
  "romantic-peony": ["Vivienne", "Theodore"],
  "romantic-rosewater": ["Rosalind", "Desmond"],

  // Modern -- crisp, contemporary, short.
  "modern-blush-mono": ["Mila", "Kai"],
  "modern-charcoal-blush": ["Nora", "Finn"],
  "modern-cobalt": ["Zara", "Leo"],
  "modern-coral-pop": ["Ruby", "Max"],
  "modern-graphite-teal": ["Ivy", "Theo"],
  "modern-ivory-noir": ["Elle", "Marcus"],
  "modern-lilac-grid": ["Vera", "Simon"],
  "modern-sage-grid": ["Nina", "Felix"],
  "modern-slate-amber": ["Tess", "Adrian"],
  "modern-terracotta-grid": ["Lena", "Diego"],

  // Botanical -- nature-adjacent, soft.
  "botanical-cherry-bloom": ["Hana", "August"],
  "botanical-eucalyptus": ["Iris", "Rowan"],
  "botanical-fern": ["Wren", "Miles"],
  "botanical-ivy-manor": ["Ivy", "Graham"],
  "botanical-lavender-sprig": ["Lavinia", "Hugo"],
  "botanical-moss": ["June", "Asher"],
  "botanical-olive-branch": ["Olive", "Elliot"],
  "botanical-sage": ["Sage", "Callum"],
  "botanical-wildflower": ["Poppy", "Dashiell"],
  "emerald-grove": ["Hazel", "Forrest"],

  // Boho -- earthy, free-spirited.
  "boho-desert-clay": ["Luna", "River"],
  "boho-dusty-rose-macrame": ["Willow", "Rome"],
  "boho-earthen-clay": ["Sienna", "Cove"],
  "boho-indigo-dye": ["Marlow", "Wolfe"],
  "boho-lavender-fields": ["Meadow", "Silas"],
  "boho-marigold-festival": ["Saffron", "Jonah"],
  "boho-sunset-rust": ["Amber", "Bodhi"],
  "boho-terracotta": ["Terra", "Kai"],
  "boho-turquoise-tribal": ["Skye", "Tobias"],
  "sage-and-clay": ["Sage", "Clay"],

  // Luxury -- elegant, opulent.
  "burgundy-velvet": ["Victoria", "Alexander"],
  "gilded-ivory": ["Genevieve", "Maximilian"],
  "luxury-black-diamond": ["Seraphina", "Constantine"],
  "luxury-champagne-pearl": ["Pearl", "Augustus"],
  "luxury-emerald-gold": ["Emeraude", "Leopold"],
  "luxury-ivory-platinum": ["Ivory", "Sterling"],
  "luxury-obsidian-copper": ["Ophelia", "Atticus"],
  "luxury-rose-gold": ["Aurelia", "Maxwell"],
  "luxury-sapphire-silver": ["Celeste", "Laurence"],
  "regal-navy-gold": ["Josephine", "Edward"],

  // Dark -- dramatic, moody. The category with the fewest Hero variants
  // (see Priority 5), so distinct names matter most here.
  "art-deco-noir": ["Vivienne", "Roman"],
  "dark-crimson-noir": ["Scarlett", "Damian"],
  "dark-espresso-gold": ["Ember", "Magnus"],
  "dark-forest-noir": ["Sylvie", "Bastian"],
  "dark-midnight-teal": ["Nadia", "Orion"],
  "dark-onyx-rose": ["Rosalie", "Dante"],
  "dark-plum-velvet": ["Aurelia", "Julian"],
  "dark-storm-silver": ["Freya", "Silvan"],
  "dark-wine-noir": ["Marceline", "Gideon"],
  "editorial-noir": ["Vera", "Maxfield"],

  // Coastal -- breezy, light.
  "coastal-azure-horizon": ["Marina", "Cole"],
  "coastal-breeze": ["Isla", "Finn"],
  "coastal-driftwood": ["Marlowe", "Harlan"],
  "coastal-harbor-blue": ["Coral", "Jonas"],
  "coastal-linen": ["Linden", "August"],
  "coastal-mist-grey": ["Greer", "Callahan"],
  "coastal-navy-sail": ["Naomi", "Beckett"],
  "coastal-sand-dune": ["Dune", "Jasper"],
  "coastal-seafoam-breeze": ["Talia", "Reef"],
  "coastal-shell-pink": ["Pearl", "Rhys"],

  // Rustic -- warm, down-to-earth, harvest.
  "rustic-barnwood": ["Clara", "Jesse"],
  "rustic-copper-oak": ["Autumn", "Cole"],
  "rustic-cornflower-farm": ["Daisy", "Wyatt"],
  "rustic-cranberry-harvest": ["Georgia", "Beau"],
  "rustic-forest-cabin": ["Hazel", "Jasper"],
  "rustic-honey-hive": ["Amelia", "Barrett"],
  "rustic-olive-grove": ["Marigold", "Gus"],
  "rustic-sunflower-field": ["Goldie", "Wesley"],
  "rustic-terracotta-pot": ["Rosemary", "Hank"],
  "rustic-wheatfield": ["June", "Harvey"],

  // Vintage -- antique, old-fashioned. The other tightest category
  // (see Priority 5) -- distinct names matter most here too.
  "vintage-amber-glass": ["Josephine", "Walter"],
  "vintage-dusty-plum": ["Cecilia", "Arthur"],
  "vintage-forest-emerald": ["Margaret", "Bennett"],
  "vintage-lilac-parlor": ["Violet", "Percival"],
  "vintage-mint-parlor": ["Winifred", "Alistair"],
  "vintage-postcard": ["Dorothy", "Clarence"],
  "vintage-powder-blue": ["Constance", "Reginald"],
  "vintage-rosewood": ["Beatrix", "Wallace"],
  "vintage-sepia-lace": ["Henrietta", "Ambrose"],
  "vintage-tobacco-leaf": ["Agatha", "Cornelius"],

  // Minimal -- clean, quiet, short.
  "dusty-blue-winter": ["Eva", "Max"],
  "minimal-blue-grey": ["Ren", "Sam"],
  "minimal-clay-line": ["Nico", "Wren"],
  "minimal-ink": ["Zoe", "Kai"],
  "minimal-porcelain": ["Mia", "Theo"],
  "minimal-sage-line": ["Alex", "Robin"],
  "minimal-stone": ["Jo", "Ash"],
  "minimal-taupe": ["Wren", "Cole"],
  "modern-mono": ["Ana", "Bo"],
  "nordic-minimal": ["Elin", "Viggo"],
};

function stableIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

/** One format everywhere -- landing-audit.md priority 14 caught the gallery
 * showing four different date stylings (long/numeric/spelled/compact,
 * varied by category) side by side in the same "All styles" grid. Rather
 * than pick a fifth style, this matches the format already canonical
 * elsewhere in the real product: `formatEventDate.ts`, every LetterSection
 * variant, and the public `/e/[slug]` page all use this exact
 * `toLocaleDateString` call -- so the catalog now previews the same date
 * styling a guest would actually see on a real site, not a separate
 * marketing-only convention. */
export function formatPreviewDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const MIN_LEAD_DAYS = 14;

/** First calendar month (0-indexed) of each season's ~3-month window --
 * used to land the preview date inside the theme's own declared season
 * rather than an arbitrary offset with no seasonal read. */
const SEASON_START_MONTH: Record<ThemeSeason, number> = {
  spring: 2, // March
  summer: 5, // June
  autumn: 8, // September
  winter: 11, // December
};

/** Always a future date relative to whenever it's computed (client-side
 * "now"), not a fixed calendar date -- so a live countdown built from it
 * never shows "today" or a negative value, and the gallery never goes stale.
 *
 * When the theme declares a `season`, the date lands inside that season's
 * window (deterministically, via the same stable-hash technique) instead of
 * an arbitrary day -- a "Dark & Moody" winter theme shouldn't preview a July
 * wedding. Themes with no declared season (a handful of deliberately
 * "timeless" modern/minimal ones) keep the original pure-offset behavior. */
export function previewTargetDateFor(themeId: string, season?: ThemeSeason): Date {
  const now = new Date();
  const minDate = new Date(now.getTime() + MIN_LEAD_DAYS * 86400000);

  if (season) {
    const startMonth = SEASON_START_MONTH[season];
    const dayOffset = stableIndex(themeId, 88); // spans a ~3-month season window
    const candidate = new Date(now.getFullYear(), startMonth, 1 + dayOffset, 18, 0, 0, 0);
    if (candidate < minDate) {
      candidate.setFullYear(candidate.getFullYear() + 1);
    }
    return candidate;
  }

  const offsetDays = 14 + stableIndex(themeId, 100);
  const target = new Date();
  target.setHours(18, 0, 0, 0);
  target.setDate(target.getDate() + offsetDays);
  return target;
}

/** Deterministic (not random) so the same theme always shows the same
 * photo/names on every render -- avoids a hydration mismatch between server
 * and client and avoids cards reshuffling every time the gallery re-filters. */
export function previewPhotoFor(themeId: string, category: ThemeCategory): string {
  const direct = THEME_PREVIEW_PHOTOS[themeId];
  if (direct) return direct;
  const photos = CATEGORY_PREVIEW_PHOTOS_FALLBACK[category];
  return photos[stableIndex(themeId, photos.length)];
}

export function previewNamesFor(themeId: string): [string, string] {
  return DEMO_NAMES[themeId] ?? PREVIEW_NAME_PAIRS[stableIndex(themeId, PREVIEW_NAME_PAIRS.length)];
}
