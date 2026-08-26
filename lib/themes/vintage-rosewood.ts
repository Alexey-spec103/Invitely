import type { Theme } from "./types";

export const vintageRosewood: Theme = {
  id: "vintage-rosewood",
  name: "Vintage Rosewood",
  category: "vintage",
  season: "autumn",
  tags: ["Vintage", "Romantic", "Autumn", "Antique", "Lace"],
  vars: {
    "--theme-bg": "#F2E4E1",
    "--theme-text": "#4A3439",
    "--theme-accent": "#A9727C",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
