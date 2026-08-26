import type { Theme } from "./types";

// A deep emerald-and-gold luxury theme -- fills the gap between Regal Navy
// & Gold (blue) and Burgundy Velvet (red/wine) with a green formal register.
export const luxuryEmeraldGold: Theme = {
  id: "luxury-emerald-gold",
  name: "Emerald & Gold",
  category: "luxury",
  season: "winter",
  tags: ["Luxury", "Dark", "Winter", "Dark Background"],
  vars: {
    "--theme-bg": "#0E1F19",
    "--theme-text": "#F0EBD8",
    "--theme-accent": "#C9A24C",
    "--theme-font-heading": "var(--font-cinzel), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/grain-dark.svg')",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
