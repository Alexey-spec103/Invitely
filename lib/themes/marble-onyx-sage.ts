import type { Theme } from "./types";

// A darker, deeper take on the sage/gold agate pairing -- same asset family
// as marble-sage-gold, moodier background.
export const marbleOnyxSage: Theme = {
  id: "marble-onyx-sage",
  name: "Onyx & Sage Marble",
  category: "marble",
  season: "winter",
  tags: ["Marble", "Dark", "Dark Background", "Winter"],
  vars: {
    "--theme-bg": "#16211C",
    "--theme-text": "#E8E9E1",
    "--theme-accent": "#C9AD6E",
    "--theme-font-heading": "var(--font-marcellus), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant), Georgia, serif",
    "--theme-font-script": "var(--font-sacramento), cursive",
  },
};
