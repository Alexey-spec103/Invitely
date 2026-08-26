import type { Theme } from "./types";

// A warm ivory-and-tan romantic theme with EB Garamond headings -- softer
// and more neutral than Champagne Rose, aimed at a classic lace-and-linen
// invitation look.
export const romanticIvoryLace: Theme = {
  id: "romantic-ivory-lace",
  name: "Ivory Lace",
  category: "romantic",
  season: "spring",
  tags: ["Romantic", "Vintage", "Spring", "Lace"],
  vars: {
    "--theme-bg": "#FCF7F1",
    "--theme-text": "#4B3E37",
    "--theme-accent": "#C9A98C",
    "--theme-font-heading": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
