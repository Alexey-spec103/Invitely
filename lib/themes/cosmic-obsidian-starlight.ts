import type { Theme } from "./types";

// Near-black, near-neutral -- the most restrained cosmic take, pale
// silvery-white accent instead of a warm gold/bronze one.
export const cosmicObsidianStarlight: Theme = {
  id: "cosmic-obsidian-starlight",
  name: "Obsidian & Starlight",
  category: "cosmic",
  tags: ["Cosmic", "Dark", "Dark Background", "Neutral"],
  vars: {
    "--theme-bg": "#0A0A0C",
    "--theme-text": "#F0EFEC",
    "--theme-accent": "#C7C9D3",
    "--theme-font-heading": "var(--font-bodoni-moda), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
