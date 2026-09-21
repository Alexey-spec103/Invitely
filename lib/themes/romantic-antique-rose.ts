import type { Theme } from "./types";

// A muted, brownish-pink "antique" rose -- warmer and dustier than Vintage
// Rosewood's mauve, for an autumn romantic register.
export const romanticAntiqueRose: Theme = {
  id: "romantic-antique-rose",
  name: "Antique Rose",
  category: "romantic",
  season: "autumn",
  tags: ["Romantic", "Vintage", "Autumn", "Antique"],
  vars: {
    "--theme-bg": "#F7EDE9",
    "--theme-text": "#45322E",
    "--theme-accent": "#B97C6E",
    "--theme-font-heading": "var(--font-gilda-display), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
