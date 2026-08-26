import type { Theme } from "./types";

// A deep indigo-dye boho theme -- the catalog's first blue-purple boho
// palette, evoking shibori/batik textile dyeing rather than desert tones.
export const bohoIndigoDye: Theme = {
  id: "boho-indigo-dye",
  name: "Indigo Dye",
  category: "boho",
  season: "winter",
  tags: ["Boho", "Bold", "Winter", "Indigo", "Unusual"],
  vars: {
    "--theme-bg": "#E9EAF0",
    "--theme-text": "#262A3D",
    "--theme-accent": "#4F5A9E",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/leaves.svg')",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
