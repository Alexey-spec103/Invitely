# Staged decorative assets (Recraft-generated)

Pilot batch of AI-generated decorative motifs, studied from weddingpost.ru references
(composition/palette/mood only — no copied HTML/CSS/assets), generated fresh via Recraft
with a paid commercial-use plan, reviewed for technical fitness before landing here.

These are **colorful, multi-hue** illustrations — a different integration pattern from
the rest of `/public/patterns/` (which are single-color shapes tinted via `mask-image` +
`background-color: var(--theme-accent)`). Colorful assets here are meant to be used
directly via `<img src="...">` with their own fixed palette, not mask-tinted.

Each file is cleaned of Recraft's embedded C2PA provenance metadata before landing here
(kept the metadata-stripped SVG only — same visual result, far smaller file size).

Nothing here is wired into any component yet. This is a review staging area: once a
motif is approved, move it up to the parent `/public/patterns/` directory (or a themed
subfolder) and wire it into the relevant section variant.

## Assets

| File | Reference mood (weddingpost.ru) | Prompt summary |
|---|---|---|
| `romantic-color-wreath.svg` | "Иван и Валерия" — burgundy/wine roses, sage eucalyptus | delicate watercolor floral wreath, burgundy and wine-red roses, sage green eucalyptus |
| `romantic-color-frame.svg` | "Кирилл и Анна" — thin gold geometric frame, blush/white roses | romantic wedding decoration, thin gold geometric frame corner, blush pink and soft white roses, sage green eucalyptus leaves |
| `romantic-color-hydrangea.svg` | "Кирилл и Анна" — all-white/blush rose and hydrangea spray | romantic wedding decoration, all-white and blush cream roses and hydrangea clusters, soft sage green leaves, elegant arching botanical spray |
| `boho-color-spray.svg` | "Андрей и Марина" — dried pampas grass, terracotta dried florals | boho wedding decoration, dried pampas grass plumes, terracotta and rust dried florals, white rose |
| `coastal-color-spray.svg` | "Морской" category — soft blue/teal ink, sandy tones | wedding corner decoration: dusty-blue starfish, sandy-tan seashell, sage seaweed sprig, pale coral accents (needed a negative prompt — "black and white, monochrome, grayscale" — the model defaults to muted/desaturated for this subject otherwise) |
| `luxury-color-peonies.svg` | "Леонид и Милана" — crimson peonies + gold on near-black | moody luxury wedding decoration, deep crimson and burgundy peonies, dark emerald green leaves, gold accent branches, jewel-tone |
| `provence-color-wisteria.svg` | "Виктория и Денис" — hanging periwinkle/lavender wisteria | provence wedding decoration, hanging wisteria clusters in periwinkle and lavender blue, soft green eucalyptus leaves |
