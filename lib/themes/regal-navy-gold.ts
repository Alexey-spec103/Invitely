import type { Theme } from "./types";

// Deep navy is a completely unused base color across the rest of the
// catalog (every dark theme so far is black/near-black or forest green) —
// paired with bright gold and Cinzel for a formal, regal register distinct
// from Art Deco Noir's true-black geometric take on gold-on-dark.
export const regalNavyGold: Theme = {
  id: "regal-navy-gold",
  name: "Regal Navy & Gold",
  category: "luxury",
  season: "winter",
  tags: ["Luxury", "Dark", "Classic", "Winter", "Dark Background"],
  vars: {
    "--theme-bg": "#101B2E",
    "--theme-text": "#EDE6D6",
    "--theme-accent": "#C9A24C",
    "--theme-font-heading": "var(--font-cinzel), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-accent": "var(--font-cinzel), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/grain-dark.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
