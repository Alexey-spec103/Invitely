import type { Theme } from "@/lib/themes";
import { canvasFontFamiliesFor } from "@/lib/canvas/fonts";

const FONT_VAR_PATTERN = /--font-([a-z0-9-]+)/;

// Words that don't follow the generic "capitalize each word" rule below --
// Google Fonts' own family name keeps this acronym fully capitalized
// ("EB Garamond"), so the generic reconstruction from a lowercase CSS var
// name ("eb-garamond" -> "Eb Garamond") would ask /api/pdf-fonts for a family
// Google Fonts doesn't recognize and get a 404. The only such exception
// among every font any theme currently uses.
const ACRONYM_WORDS: Record<string, string> = { eb: "EB" };

/** Theme font vars reference next/font CSS variables (browser-only) in the
 * shape `var(--font-some-name), var(--font-cyrillic-fallback), fallback,
 * serif` — this recovers the PRIMARY family's actual Google Font name
 * generically from the first var() reference (`--font-cormorant-garamond`
 * -> "Cormorant Garamond") rather than matching against a fixed list, so any
 * current or future theme font resolves correctly without this file needing
 * an update every time a theme adds a new typeface. The 5 self-hosted
 * families (registerPdfFonts) still render from local files; every other
 * family is registered on demand via registerCanvasPdfFont, which callers
 * must also invoke — see InvitationDocument.tsx for the pattern. */
function resolveFontFamily(cssVarValue: string): string {
  const match = FONT_VAR_PATTERN.exec(cssVarValue);
  if (!match) {
    return "Inter";
  }
  return match[1]
    .split("-")
    .map((word) => ACRONYM_WORDS[word] ?? word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export interface PdfThemeStyle {
  background: string;
  text: string;
  accent: string;
  // react-pdf picks, per glyph, the first family in this array that
  // actually has it (same as the canvas path, see lib/canvas/fonts.ts) --
  // most theme fonts have zero Cyrillic glyphs in their own font file, so a
  // theme's primary heading/body font alone isn't enough for a host who
  // writes Cyrillic content.
  headingFont: string[];
  bodyFont: string[];
}

export function getPdfThemeStyle(theme: Theme): PdfThemeStyle {
  return {
    background: theme.vars["--theme-bg"],
    text: theme.vars["--theme-text"],
    accent: theme.vars["--theme-accent"],
    headingFont: canvasFontFamiliesFor(resolveFontFamily(theme.vars["--theme-font-heading"])),
    bodyFont: canvasFontFamiliesFor(resolveFontFamily(theme.vars["--theme-font-body"])),
  };
}
