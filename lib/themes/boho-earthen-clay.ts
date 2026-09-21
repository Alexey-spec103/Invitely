import type { Theme } from "./types";

// A muted earthen-clay boho theme straddling boho and rustic -- browner
// and less saturated than Desert Clay or Sunset Rust.
export const bohoEarthenClay: Theme = {
  id: "boho-earthen-clay",
  name: "Earthen Clay",
  category: "boho",
  season: "autumn",
  tags: ["Boho", "Rustic", "Autumn", "Earthy"],
  vars: {
    "--theme-bg": "#EEE1D0",
    "--theme-text": "#453322",
    "--theme-accent": "#A9764E",
    "--theme-font-heading": "var(--font-cormorant), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
