import type { Theme } from "./types";

// Deep violet night sky, cool silver accent -- a cooler variant of the
// midnight-gold pairing.
export const cosmicVioletSilver: Theme = {
  id: "cosmic-violet-silver",
  name: "Violet & Silver",
  category: "cosmic",
  season: "winter",
  tags: ["Cosmic", "Dark", "Dark Background", "Winter"],
  vars: {
    "--theme-bg": "#160F22",
    "--theme-text": "#EDE9F3",
    "--theme-accent": "#A6A0B8",
    "--theme-font-heading": "var(--font-italiana), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant), Georgia, serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
