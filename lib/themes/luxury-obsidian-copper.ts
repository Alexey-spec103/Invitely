import type { Theme } from "./types";

// A true-black luxury theme with a warm copper accent -- distinct from
// Black Diamond's achromatic take, this brings warmth back into a
// near-black base.
export const luxuryObsidianCopper: Theme = {
  id: "luxury-obsidian-copper",
  name: "Obsidian & Copper",
  category: "luxury",
  season: "autumn",
  tags: ["Luxury", "Dark", "Autumn", "Dark Background"],
  vars: {
    "--theme-bg": "#14100E",
    "--theme-text": "#EFE7DE",
    "--theme-accent": "#B8703F",
    "--theme-font-heading": "var(--font-cinzel), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
