import type { Theme } from "./types";

export const botanicalSage: Theme = {
  id: "botanical-sage",
  name: "Botanical Sage",
  category: "botanical",
  season: "spring",
  tags: ["Botanical", "Romantic", "Spring", "Greenery"],
  vars: {
    "--theme-bg": "#EDF0E9",
    "--theme-text": "#3D4A3A",
    "--theme-accent": "#8B9D77",
    "--theme-font-heading": "var(--font-cormorant), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
