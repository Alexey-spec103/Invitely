import { Font } from "@react-pdf/renderer";

export type PdfFontFamily =
  | "Cormorant Garamond"
  | "Inter"
  | "Playfair Display"
  | "Fraunces"
  | "Great Vibes";

const FONT_FILES: Record<PdfFontFamily, { regular: string; bold: string }> = {
  // Cormorant Garamond/Inter/Playfair Display are also the serif/sans-serif/
  // display Cyrillic fallback targets lib/canvas/fonts.ts routes any
  // non-Cyrillic-capable canvas font to -- these three (plus Great Vibes,
  // the script fallback) are sourced from Google's actual variable-font
  // files (github.com/google/fonts), not the usual legacy-Android-UA fetch
  // this file's other font resolution relies on. Confirmed live: that
  // legacy route -- and the original static files self-hosted through it --
  // serve a Latin-only glyph set regardless of the family's real language
  // support, so a Cyrillic codepoint resolved no glyph in ANY registered
  // font and react-pdf/fontkit's fallback-of-last-resort produced visibly
  // wrong glyphs (not even a blank box) instead of the intended character.
  // Reusing one variable-font file for both weight slots means "bold" canvas
  // text in these four families renders at the file's default instance
  // weight rather than a true separate bold design -- a minor cosmetic
  // tradeoff against actually having working Cyrillic glyphs at all.
  "Cormorant Garamond": {
    regular: "/fonts/cormorant-garamond-400.ttf",
    bold: "/fonts/cormorant-garamond-600.ttf",
  },
  Inter: {
    regular: "/fonts/inter-400.ttf",
    bold: "/fonts/inter-600.ttf",
  },
  "Playfair Display": {
    regular: "/fonts/playfair-display-400.ttf",
    bold: "/fonts/playfair-display-600.ttf",
  },
  Fraunces: {
    regular: "/fonts/fraunces-400.ttf",
    bold: "/fonts/fraunces-600.ttf",
  },
  // Not previously self-hosted at all -- lib/canvas/fonts.ts's script
  // Cyrillic fallback, so it has to be genuinely Cyrillic-complete the same
  // way the three above are.
  "Great Vibes": {
    regular: "/fonts/great-vibes-400.ttf",
    bold: "/fonts/great-vibes-400.ttf",
  },
};

// Shared across both registration paths below so a canvas that happens to
// use one of the 4 self-hosted families (fast, local file) never gets
// re-registered against the slower on-demand proxy route.
const registeredFamilies = new Set<string>();

let registered = false;

/** react-pdf can't use the site's next/font CSS variables (browser-only) — it
 * needs real font files registered by name. Self-hosted under public/fonts
 * (downloaded once from Google Fonts) rather than fetched from Google at
 * generation time, so PDF downloads don't depend on an external host. */
export function registerPdfFonts() {
  if (registered) {
    return;
  }
  registered = true;

  for (const [family, files] of Object.entries(FONT_FILES) as [
    PdfFontFamily,
    { regular: string; bold: string },
  ][]) {
    Font.register({
      family,
      fonts: [
        { src: files.regular, fontWeight: 400 },
        { src: files.bold, fontWeight: 600 },
      ],
    });
    registeredFamilies.add(family);
  }
}

/** Canvas designs can use any of ~150 curated Google Fonts (lib/canvas/fonts.ts),
 * not just the 4 self-hosted here — pre-downloading all of them isn't
 * practical. Instead each family is registered against /api/pdf-fonts, which
 * resolves the real .ttf URL on demand the same way the 4 static fonts were
 * originally sourced (see that route for why). react-pdf only fetches a
 * registered font's bytes lazily, when it's actually used in a render, so
 * this stays cheap even if a document ends up not using every family. */
export function registerCanvasPdfFont(family: string) {
  if (registeredFamilies.has(family)) {
    return;
  }
  registeredFamilies.add(family);

  Font.register({
    family,
    fonts: [
      { src: `/api/pdf-fonts?family=${encodeURIComponent(family)}&weight=400`, fontWeight: 400 },
      { src: `/api/pdf-fonts?family=${encodeURIComponent(family)}&weight=700`, fontWeight: 700 },
    ],
  });
}
