import type { Theme } from "./types";

// Space Grotesk for both heading and body on an ivory (not stark-white)
// base -- a warmer sibling to Ink's true-white mono take.
export const modernIvoryNoir: Theme = {
  id: "modern-ivory-noir",
  name: "Ivory Noir",
  category: "modern",
  tags: ["Modern", "Minimal", "Bold", "Typography"],
  vars: {
    "--theme-bg": "#FAF9F7",
    "--theme-text": "#1A1A1A",
    "--theme-accent": "#1A1A1A",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
