import type { Theme } from "./types";

// A travel-postcard vintage register -- brick red accent with Cinzel
// headings (usually reserved for luxury/dark themes here used at a much
// lighter, warmer register) and a Caveat script for a handwritten-postmark feel.
export const vintagePostcard: Theme = {
  id: "vintage-postcard",
  name: "Vintage Postcard",
  category: "vintage",
  season: "autumn",
  tags: ["Vintage", "Classic", "Autumn", "Antique"],
  vars: {
    "--theme-bg": "#F0E8DC",
    "--theme-text": "#43392E",
    "--theme-accent": "#B6604A",
    "--theme-font-heading": "var(--font-cinzel), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
