export interface CanvasFontOption {
  family: string;
  category: "serif" | "sans-serif" | "script" | "display";
}

/** ~150 curated Google Fonts spanning serif/sans/script/display, matching
 * weddingpost.ru's own "150+ fonts" benchmark from the Phase 7 gap analysis.
 * A full 1500+ dynamic catalog would need either a Google Fonts API key (not
 * configured) or a 50MB+ metadata package for names we mostly wouldn't use —
 * this curated, wedding-invitation-relevant set is the load-bearing part of
 * the comparison, not the raw count. */
export const CANVAS_FONTS: CanvasFontOption[] = [
  // Serif
  { family: "Playfair Display", category: "serif" },
  { family: "Cormorant Garamond", category: "serif" },
  { family: "Cormorant", category: "serif" },
  { family: "Cormorant Infant", category: "serif" },
  { family: "Fraunces", category: "serif" },
  { family: "Lora", category: "serif" },
  { family: "Merriweather", category: "serif" },
  { family: "EB Garamond", category: "serif" },
  { family: "Crimson Text", category: "serif" },
  { family: "Crimson Pro", category: "serif" },
  { family: "Bodoni Moda", category: "serif" },
  { family: "DM Serif Display", category: "serif" },
  { family: "DM Serif Text", category: "serif" },
  { family: "Libre Baskerville", category: "serif" },
  { family: "Marcellus", category: "serif" },
  { family: "Marcellus SC", category: "serif" },
  { family: "Prata", category: "serif" },
  { family: "Spectral", category: "serif" },
  { family: "Vollkorn", category: "serif" },
  { family: "Cinzel", category: "serif" },
  { family: "Cinzel Decorative", category: "serif" },
  { family: "Domine", category: "serif" },
  { family: "PT Serif", category: "serif" },
  { family: "Noto Serif", category: "serif" },
  { family: "Bitter", category: "serif" },
  { family: "Rufina", category: "serif" },
  { family: "Sorts Mill Goudy", category: "serif" },
  { family: "Petrona", category: "serif" },
  { family: "Alegreya", category: "serif" },
  { family: "Alegreya SC", category: "serif" },
  { family: "Gilda Display", category: "serif" },
  { family: "Italiana", category: "serif" },
  { family: "Ledger", category: "serif" },
  { family: "Old Standard TT", category: "serif" },
  { family: "Cardo", category: "serif" },
  { family: "Frank Ruhl Libre", category: "serif" },
  { family: "Vidaloka", category: "serif" },
  { family: "Baskervville", category: "serif" },
  { family: "Josefin Slab", category: "serif" },
  { family: "Zilla Slab", category: "serif" },
  { family: "Aleo", category: "serif" },

  // Sans-serif
  { family: "Inter", category: "sans-serif" },
  { family: "Montserrat", category: "sans-serif" },
  { family: "Poppins", category: "sans-serif" },
  { family: "Raleway", category: "sans-serif" },
  { family: "Josefin Sans", category: "sans-serif" },
  { family: "Nunito", category: "sans-serif" },
  { family: "Nunito Sans", category: "sans-serif" },
  { family: "Lato", category: "sans-serif" },
  { family: "Work Sans", category: "sans-serif" },
  { family: "Karla", category: "sans-serif" },
  { family: "Jost", category: "sans-serif" },
  { family: "Quicksand", category: "sans-serif" },
  { family: "Mulish", category: "sans-serif" },
  { family: "Manrope", category: "sans-serif" },
  { family: "DM Sans", category: "sans-serif" },
  { family: "Outfit", category: "sans-serif" },
  { family: "Sora", category: "sans-serif" },
  { family: "Urbanist", category: "sans-serif" },
  { family: "Cormorant Unicase", category: "sans-serif" },
  { family: "Assistant", category: "sans-serif" },
  { family: "Barlow", category: "sans-serif" },
  { family: "Barlow Condensed", category: "sans-serif" },
  { family: "Archivo", category: "sans-serif" },
  { family: "Rubik", category: "sans-serif" },
  { family: "Questrial", category: "sans-serif" },
  { family: "Comfortaa", category: "sans-serif" },
  { family: "Overpass", category: "sans-serif" },
  { family: "Hind", category: "sans-serif" },
  { family: "Muli", category: "sans-serif" },
  { family: "Catamaran", category: "sans-serif" },
  { family: "Krub", category: "sans-serif" },
  { family: "Yantramanav", category: "sans-serif" },
  { family: "Cantarell", category: "sans-serif" },
  { family: "PT Sans", category: "sans-serif" },
  { family: "Noto Sans", category: "sans-serif" },
  { family: "Fira Sans", category: "sans-serif" },
  { family: "Prompt", category: "sans-serif" },
  { family: "Maven Pro", category: "sans-serif" },
  { family: "Epilogue", category: "sans-serif" },
  { family: "Figtree", category: "sans-serif" },

  // Script / handwritten
  { family: "Alex Brush", category: "script" },
  { family: "Great Vibes", category: "script" },
  { family: "Dancing Script", category: "script" },
  { family: "Caveat", category: "script" },
  { family: "Tangerine", category: "script" },
  { family: "Parisienne", category: "script" },
  { family: "Yellowtail", category: "script" },
  { family: "Amatic SC", category: "script" },
  { family: "Sacramento", category: "script" },
  { family: "Pinyon Script", category: "script" },
  { family: "Allura", category: "script" },
  { family: "Mrs Saint Delafield", category: "script" },
  { family: "Petit Formal Script", category: "script" },
  { family: "Herr Von Muellerhoff", category: "script" },
  { family: "Kristi", category: "script" },
  { family: "Meddon", category: "script" },
  { family: "Mr De Haviland", category: "script" },
  { family: "Rouge Script", category: "script" },
  { family: "Italianno", category: "script" },
  { family: "Style Script", category: "script" },
  { family: "WindSong", category: "script" },
  { family: "Bad Script", category: "script" },
  { family: "Marck Script", category: "script" },
  { family: "Playball", category: "script" },
  { family: "Cookie", category: "script" },
  { family: "Satisfy", category: "script" },
  { family: "Kalam", category: "script" },
  { family: "Homemade Apple", category: "script" },
  { family: "Shadows Into Light", category: "script" },
  { family: "Reenie Beanie", category: "script" },
  { family: "Grand Hotel", category: "script" },
  { family: "Euphoria Script", category: "script" },
  { family: "Alegreya Script SC", category: "script" },
  { family: "Norican", category: "script" },
  { family: "Give You Glory", category: "script" },
  { family: "Qwigley", category: "script" },
  { family: "Lovers Quarrel", category: "script" },
  { family: "Ballet", category: "script" },
  { family: "Bonheur Royale", category: "script" },
  { family: "Beau Rivage", category: "script" },
  { family: "Rochester", category: "script" },
  { family: "Monsieur La Doulaise", category: "script" },
  { family: "Berkshire Swash", category: "script" },
  { family: "Miss Fajardose", category: "script" },
  { family: "Corinthia", category: "script" },
  { family: "Whisper", category: "script" },
  { family: "Clicker Script", category: "script" },

  // Display / decorative
  { family: "Pacifico", category: "display" },
  { family: "Abril Fatface", category: "display" },
  { family: "Playfair Display SC", category: "display" },
  { family: "Fjalla One", category: "display" },
  { family: "Righteous", category: "display" },
  { family: "Josefin Sans SC", category: "display" },
  { family: "Ultra", category: "display" },
  { family: "Bungee", category: "display" },
  { family: "Lobster", category: "display" },
  { family: "Alfa Slab One", category: "display" },
  { family: "Special Elite", category: "display" },
  { family: "Bebas Neue", category: "display" },
  { family: "Oswald", category: "display" },
  { family: "Amiri", category: "display" },
  { family: "Forum", category: "display" },
  { family: "Kaisei Decol", category: "display" },
  { family: "Big Shoulders Display", category: "display" },
  { family: "Rozha One", category: "display" },
  { family: "Fascinate", category: "display" },
  { family: "Yeseva One", category: "display" },
  { family: "Unica One", category: "display" },
];

export const CANVAS_FONT_OPTIONS: string[] = CANVAS_FONTS.map((f) => f.family);

export function canvasFontStylesheetUrl(family: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:wght@300;400;500;600;700&display=swap`;
}

const loadedFonts = new Set<string>();

/** Google Fonts have to be loaded on demand — next/font requires
 * build-time-known imports, which doesn't work for "any font a user picks
 * at runtime." Injects a <link> once per family and lets the browser cache
 * it from then on. Editor-only (imperative DOM write) — the read-only
 * CanvasRenderer renders <link> tags directly in JSX instead, since this
 * needs to work during SSR too, see CanvasRenderer.tsx. */
export function ensureCanvasFontLoaded(family: string) {
  if (typeof document === "undefined" || loadedFonts.has(family)) {
    return;
  }
  loadedFonts.add(family);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = canvasFontStylesheetUrl(family);
  document.head.appendChild(link);
}
