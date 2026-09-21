import type { Theme } from "./types";

// Near-black marble with a burnt-rust/copper accent -- pairs with
// marble-color-dark.svg's own charcoal-and-orange agate veining.
export const marbleNoirRust: Theme = {
  id: "marble-noir-rust",
  name: "Noir & Rust Marble",
  category: "marble",
  season: "autumn",
  tags: ["Marble", "Dark", "Dark Background", "Autumn"],
  vars: {
    "--theme-bg": "#14100E",
    "--theme-text": "#EFE7DE",
    "--theme-accent": "#BA6E3F",
    "--theme-font-heading": "var(--font-bodoni-moda), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
