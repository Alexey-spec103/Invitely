import type { Theme } from "./types";

// The starkest theme in the catalog -- true black-on-white, one font family
// for both heading and body, no warmth at all. For a couple who wants
// typography to do all the work.
export const minimalInk: Theme = {
  id: "minimal-ink",
  name: "Ink",
  category: "minimal",
  tags: ["Minimal", "Modern", "Bold", "Typography", "Minimalism"],
  vars: {
    "--theme-bg": "#FFFFFF",
    "--theme-text": "#0A0A0A",
    "--theme-accent": "#0A0A0A",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
