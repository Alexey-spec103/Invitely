import type { Theme } from "./types";

// Deep navy-black night sky with gold stars -- palette chosen to pair with
// the Космический batch's own muted charcoal/gold star illustrations (see
// decorMotifs.ts), which read as washed-out on anything but a dark base.
export const cosmicMidnightGold: Theme = {
  id: "cosmic-midnight-gold",
  name: "Midnight & Gold",
  category: "cosmic",
  season: "winter",
  tags: ["Cosmic", "Dark", "Dark Background", "Winter"],
  vars: {
    "--theme-bg": "#0D0F1A",
    "--theme-text": "#EDE9DD",
    "--theme-accent": "#C9A24C",
    "--theme-font-heading": "var(--font-bodoni-moda), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
