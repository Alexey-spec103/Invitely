import type { Theme } from "./types";

// A powder-blue vintage theme -- the catalog's first blue-family vintage
// register, evoking 1960s stationery rather than the usual warm vintage tones.
export const vintagePowderBlue: Theme = {
  id: "vintage-powder-blue",
  name: "Powder Blue",
  category: "vintage",
  season: "winter",
  tags: ["Vintage", "Classic", "Winter", "Antique"],
  vars: {
    "--theme-bg": "#E9EEF0",
    "--theme-text": "#2E3A40",
    "--theme-accent": "#7FA3B0",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
