import type { Theme } from "./types";

// First "rustic" theme in the catalog -- a warm parchment/wood palette with
// Libre Baskerville's book-like texture and a Caveat script, aimed at a
// barn or countryside wedding rather than a formal indoor one.
export const rusticBarnwood: Theme = {
  id: "rustic-barnwood",
  name: "Barnwood",
  category: "rustic",
  season: "autumn",
  tags: ["Rustic", "Warm", "Autumn", "Landscape"],
  vars: {
    "--theme-bg": "#EDE3D3",
    "--theme-text": "#4A3826",
    "--theme-accent": "#8B5E34",
    "--theme-font-heading": "var(--font-libre-baskerville), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
