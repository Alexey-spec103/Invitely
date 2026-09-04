import type { Theme } from "./types";

// A sepia-toned vintage register -- Libre Baskerville headings over EB
// Garamond body, distinct from Vintage Rosewood's pink-mauve palette.
export const vintageSepiaLace: Theme = {
  id: "vintage-sepia-lace",
  name: "Sepia Lace",
  category: "vintage",
  season: "autumn",
  tags: ["Vintage", "Romantic", "Autumn", "Lace", "Antique"],
  vars: {
    "--theme-bg": "#F1E7D8",
    "--theme-text": "#4A3B2E",
    "--theme-accent": "#9B7653",
    "--theme-font-heading": "var(--font-libre-baskerville), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
