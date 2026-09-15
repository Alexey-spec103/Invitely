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
| `boho-color-lineart.svg` | Бохо category — delicate line-art dried fern + cosmos | boho wedding decoration, delicate dried fern leaves and white cosmos flowers, thin brown curved line accent, sparse line-art |
| `boho-color-frame.svg` | "Константин и Мария" — gold geometric frame, pampas grass | boho wedding decoration, thin gold geometric angular frame corner, white cosmos flowers, tan and brown dried pampas grass plumes |
| `coastal-color-spray.svg` | "Морской" category — soft blue/teal ink, sandy tones | wedding corner decoration: dusty-blue starfish, sandy-tan seashell, sage seaweed sprig, pale coral accents (needed a negative prompt — "black and white, monochrome, grayscale" — the model defaults to muted/desaturated for this subject otherwise) |
| `coastal-color-shell.svg` | "Алексей и Анастасия" — minimalist blue line-art shell emblem | coastal wedding decoration, delicate blue line-art seashell emblem, thin scattered dot accents, minimalist |
| `coastal-color-badge.svg` | nautical anchor motif (own composition) | coastal wedding decoration, small navy blue anchor icon, scattered coral starfish and white seashells, sage seaweed sprig — **has an intentional opaque circular badge background, not transparent** (see LOG.md) |
| `luxury-color-peonies.svg` | "Леонид и Милана" — crimson peonies + gold on near-black | moody luxury wedding decoration, deep crimson and burgundy peonies, dark emerald green leaves, gold accent branches, jewel-tone |
| `luxury-color-stars.svg` | "Фаина и Роман" — gold stars/moon on navy blue | moody luxury wedding decoration, gold stars and crescent moon, delicate gold constellation lines, deep navy blue — came back as a full frame, not a corner accent |
| `luxury-color-leaves.svg` | "Вячеслав и Александра" — metallic gold autumn leaves on black | vivid metallic gold foil oak leaf branch with acorns, rich amber and bronze gold gradient (needed a strong negative prompt to avoid a pale/grey default — leaves still came out grey-green, branch/acorns are true gold) |
| `provence-color-wisteria.svg` | "Виктория и Денис" — hanging periwinkle/lavender wisteria | provence wedding decoration, hanging wisteria clusters in periwinkle and lavender blue, soft green eucalyptus leaves |
| `provence-color-archway.svg` | "Даниэль и Ирина" — pink roses over a stone archway | provence wedding decoration, blush pink and rose climbing florals over a rustic stone archway corner — one of the strongest results in the batch |
| `provence-color-lavender.svg` | "Жанна и Марат" — lavender field with a stone cottage | provence wedding decoration, lavender field with a small rustic stone cottage silhouette, rolling hills — landscape scene, muted mauve-grey palette rather than vivid purple |
