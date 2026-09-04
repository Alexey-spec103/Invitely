import type { Theme } from "./types";

// A rustic take on terracotta (vs. the boho and modern terracotta themes
// elsewhere) -- Libre Baskerville's book-serif texture keeps this reading
// as farmhouse/rustic rather than bohemian.
export const rusticTerracottaPot: Theme = {
  id: "rustic-terracotta-pot",
  name: "Terracotta Pot",
  category: "rustic",
  season: "autumn",
  tags: ["Rustic", "Warm", "Autumn", "Landscape"],
  vars: {
    "--theme-bg": "#F1E4D6",
    "--theme-text": "#4C3A2B",
    "--theme-accent": "#B15E3D",
    "--theme-font-heading": "var(--font-libre-baskerville), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
