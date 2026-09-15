# Decorative asset generation log

Per weddingpost.ru category: pick up to 3 strong references (composition/palette
study only — never copied HTML/CSS/exact colors/exact paths), write a Recraft prompt
derived from what was studied, generate, review, save. Each entry below records the
reference, what was studied about it, the exact prompt used, and the resulting file —
so this can be picked up and continued at any point without re-deriving anything.

All assets generated on a paid Recraft plan (commercial-use rights). Colorful,
multi-hue illustrations — used via `<img>` with their own fixed palette, not the
mask-image/theme-accent tinting technique the rest of `/public/patterns/` uses.

Locked Recraft style for this batch (for cross-asset consistency): see note per batch below.

---

## Романтический (romantic)

### Reference 1 — "Иван и Валерия" invitation card
**Studied:** watercolor-style circular wreath, dense at top/bottom, open at the
sides, burgundy/wine-red roses mixed with sage-green eucalyptus-style leaves,
asymmetric (not perfectly symmetric) placement.
**Prompt:** `delicate watercolor floral wreath, burgundy and wine-red roses with
sage green eucalyptus leaves, circular wreath frame open at top and bottom, elegant
wedding invitation botanical illustration, flat vector, isolated on transparent
background, no text`
**Saved as:** `romantic-color-wreath.svg`

### Reference 2 — "Кирилл & Анна" invitation card (gold frame variant)
**Studied:** thin gold geometric diamond-shaped frame corner, blush pink and soft
white roses tucked into the frame, sage green eucalyptus leaves — a more
"formal/lined" romantic look than the wreath (a frame instead of a full wreath).
**Prompt:** `romantic wedding decoration, thin gold geometric frame corner, blush
pink and soft white roses, sage green eucalyptus leaves, elegant flat vector
illustration, isolated on transparent background, no text, colorful`
**Saved as:** `romantic-color-frame.svg`

### Reference 3 — "Кирилл & Анна" invitation card (white/blush variant)
**Studied:** same card family as Reference 2, but the all-white/blush-cream rose
and hydrangea study instead of the frame — larger rose blooms with soft blush-pink
centers, small hydrangea florets clustered at the base, sage leaves, arching spray
composition (asymmetric, cascading from upper-left to lower-right, not a wreath).
Recraft generated 4 variants across 2 batches for this prompt; picked the one with
the clearest blush-pink centers and the most visible hydrangea cluster (others were
either too flat/green or had a different, less balanced composition).
**Prompt:** `romantic wedding decoration, all-white and blush cream roses and
hydrangea clusters, soft sage green leaves, elegant arching botanical spray, flat
vector illustration, isolated on transparent background, no text, colorful`
**Saved as:** `romantic-color-hydrangea.svg`

**Романтический status: 3/3 references done.**

---

## Бохо (boho)

### Reference 1 — "Андрей и Марина" invitation card
**Studied:** dried pampas grass plumes (cream/tan), terracotta/rust dried florals,
one white rose accent, asymmetric corner spray (not centered), thin gold line arc
motif in the original (not carried into the prompt — decorative accent, not a
color/composition cue worth reproducing).
**Prompt:** `boho wedding decoration, dried pampas grass plumes, terracotta and
rust dried florals, cream and tan tones, small white rose, asymmetric corner
arrangement, flat vector illustration, isolated on transparent background, no text`
**Saved as:** `boho-color-spray.svg`

---

## Морской (coastal)

### Reference 1 — "Морской" category mood (no single card — the category's
overall palette: dusty blue, teal ink-wash, sandy tones — most cards in this
category are full-bleed watercolor backgrounds, not small motifs, so this was a
palette study rather than one specific card's composition).
**Studied:** soft dusty blue + sandy beige as the dominant pairing across the
category.
**Prompt attempt 1 (failed):** `colorful coastal wedding decoration, pastel dusty
blue and warm sandy beige colors, painted sea shells and starfish, soft green dune
grass sprigs...` — Recraft defaulted to a desaturated/monochrome result twice in a
row despite "colorful"/"not monochrome" in the main prompt.
**Fix that worked:** moved color to per-object attribution + used Recraft's
**negative prompt** field (Settings → Negative prompt): `black and white,
monochrome, grayscale, sepia, desaturated, line art only, no color`
**Prompt (final):** `wedding corner decoration illustration: a dusty-blue
watercolor starfish, a sandy-tan seashell, a soft sage-green seaweed sprig, and
pale coral accents, arranged in a loose asymmetric cluster, flat vector wedding
stationery illustration, isolated on transparent background, no text, vivid pastel
colors` + negative prompt above
**Saved as:** `coastal-color-spray.svg` (still fairly muted — authentic to the
category's own dusty palette, not a failure)

---

## Тёмный фон / Luxury (dark-luxury)

### Reference 1 — "Леонид и Милана" invitation card
**Studied:** near-black background, deep crimson/magenta peonies, dark leaves,
thin gold script text (text itself not reproduced — just the color pairing: gold +
crimson on near-black).
**Prompt:** `moody luxury wedding decoration, deep crimson and burgundy peonies,
dark emerald green leaves, gold accent branches, jewel-tone flat vector
illustration, isolated on transparent background, no text, no background
rectangle`
**Saved as:** `luxury-color-peonies.svg`

---

## Прованс (provence)

### Reference 1 — "Виктория и Денис" invitation card
**Studied:** hanging wisteria clusters in periwinkle/lavender-blue, soft green
leaves, cascading-from-top composition (not a wreath or corner spray — this one
hangs).
**Prompt:** `provence wedding decoration, hanging wisteria clusters in periwinkle
and lavender blue, soft green eucalyptus leaves, delicate watercolor style
botanical spray, flat vector illustration, isolated on transparent background, no
text, colorful`
**Saved as:** `provence-color-wisteria.svg`

---

<!-- Next: bring each category above up to 3 references, then move to remaining
categories (Пионы, Мраморный/vintage, Восточный, Рустик, Ажурный, etc.) -->
