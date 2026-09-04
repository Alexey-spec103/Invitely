import type { Theme } from "./types";

// True black with a near-white "diamond" accent instead of gold -- the
// catalog's first achromatic luxury theme, for a couple who wants formal
// without any warm metallic tone at all.
export const luxuryBlackDiamond: Theme = {
  id: "luxury-black-diamond",
  name: "Black Diamond",
  category: "luxury",
  tags: ["Luxury", "Dark", "Modern", "Dark Background", "Abstract"],
  vars: {
    "--theme-bg": "#0A0A0C",
    "--theme-text": "#F2F2F0",
    "--theme-accent": "#E8E8E4",
    "--theme-font-heading": "var(--font-cinzel), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
