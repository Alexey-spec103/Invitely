import type { Theme } from "@/lib/themes";

const FONT_VAR_PATTERN = /--font-([a-z0-9-]+)/;

/** Theme font vars reference next/font CSS variables (browser-only) in the
 * shape `var(--font-some-name), fallback, serif` — this recovers the actual
 * Google Font family name generically from the variable name itself
 * (`--font-cormorant-garamond` -> "Cormorant Garamond") rather than matching
 * against a fixed list, so any current or future theme font resolves
 * correctly without this file needing an update every time a theme adds a
 * new typeface. The 4 originally self-hosted families (registerPdfFonts)
 * still render from local files; every other family is registered on demand
 * via registerCanvasPdfFont, which callers must also invoke — see
 * InvitationDocument.tsx for the pattern. */
function resolveFontFamily(cssVarValue: string): string {
  const match = FONT_VAR_PATTERN.exec(cssVarValue);
  if (!match) {
    return "Inter";
  }
  return match[1]
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export interface PdfThemeStyle {
  background: string;
  text: string;
  accent: string;
  headingFont: string;
  bodyFont: string;
}

export function getPdfThemeStyle(theme: Theme): PdfThemeStyle {
  return {
    background: theme.vars["--theme-bg"],
    text: theme.vars["--theme-text"],
    accent: theme.vars["--theme-accent"],
    headingFont: resolveFontFamily(theme.vars["--theme-font-heading"]),
    bodyFont: resolveFontFamily(theme.vars["--theme-font-body"]),
  };
}
