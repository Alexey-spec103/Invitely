import type { Theme } from "./types";

// True black + bright gold + a geometric lattice texture and all-caps-
// friendly Cinzel headings — a distinct Gatsby-era register from Editorial
// Noir (warm near-black, muted bronze accent, Playfair headings, grain
// texture). Both are dark/luxury but read as genuinely different rooms.
export const artDecoNoir: Theme = {
  id: "art-deco-noir",
  name: "Art Deco Noir",
  category: "dark",
  tags: ["Luxury", "Dark", "Modern", "Dark Background", "Abstract"],
  vars: {
    "--theme-bg": "#0D0D0D",
    "--theme-text": "#F0EAE0",
    "--theme-accent": "#D4AF37",
    "--theme-font-heading": "var(--font-cinzel), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-cinzel), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/art-deco-lattice.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
