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

### Reference 2 — line-art dried botanical card (style browser, Бохо category)
**Studied:** delicate thin-line style — dried fern leaves, white cosmos flowers,
a thin brown curved line arcing behind the spray, very sparse/airy composition
(mostly negative space) rather than a dense cluster — the "quiet" end of boho,
distinct from Reference 1's dense colorful spray.
**Prompt:** `boho wedding decoration, delicate dried fern leaves and white cosmos
flowers, thin brown curved line accent, sparse elegant line-art botanical
illustration, flat vector, isolated on transparent background, no text, colorful`
**Saved as:** `boho-color-lineart.svg`

### Reference 3 — "Константин и Мария" invitation card
**Studied:** thin gold geometric angular frame (polygon, not a simple circle/diamond),
white cosmos flowers clustered with tan/brown dried pampas grass plumes tucked into
one corner of the frame — same gold-geometric-frame device as the Романтический
category's Reference 2, but paired with boho's pampas-grass palette instead of roses.
**Prompt:** `boho wedding decoration, thin gold geometric angular frame corner,
white cosmos flowers, tan and brown dried pampas grass plumes, elegant flat vector
illustration, isolated on transparent background, no text, colorful`
**Saved as:** `boho-color-frame.svg`

**Бохо status: 3/3 references done.**

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

### Reference 2 — "Алексей и Анастасия" invitation card (minimalist variant)
**Studied:** unlike most Морской cards (full-bleed watercolor scenes), this one is
a clean white background with a small elegant blue line-art seashell emblem at the
top and thin scattered dot accents — the minimalist end of the coastal category.
**Prompt:** `coastal wedding decoration, delicate blue line-art seashell emblem,
thin scattered dot accents, minimalist elegant illustration, flat vector, isolated
on transparent background, no text, colorful`
**Saved as:** `coastal-color-shell.svg`

### Reference 3 — nautical anchor motif (own composition, not a single weddingpost.ru
card — this category's small-motif options were exhausted after References 1-2, so
this explores a related nautical subject in the same category's palette).
**Studied:** anchor + starfish + seaweed as a distinct coastal sub-theme (nautical,
not shells/watercolor).
**Prompt attempts 1-3 (issue, not a failure):** every anchor+rope composition
Recraft generated — regardless of phrasing ("entwined with rope", "die-cut sticker
style", explicit "no background shape") — came back with a solid or circular
backdrop shape baked into the vector itself (not a removable PNG background; a real
path in the SVG, color `#E4E5DF`). Concluded this is the model's natural style for
this composition (a badge/emblem backdrop), not a bug to fight further — round
wax-seal-style emblems are a legitimate, common wedding-invitation motif, so the
circular badge was kept deliberately rather than re-attempted a 4th time.
**Prompt (final, badge accepted):** `coastal wedding decoration, small navy blue
anchor icon, scattered coral starfish and white seashells, sage seaweed sprig,
elegant flat vector illustration, isolated on transparent background, no text,
colorful, no rope, no circular frame, no background shape`
**Saved as:** `coastal-color-badge.svg` — **note:** unlike every other staged
asset, this one has an intentional opaque circular badge background baked in
(taupe/beige `#E4E5DF`), not a transparent cutout. Use only where a round badge
shape fits the layout, or as inspiration to redraw as a true die-cut in a future
pass.

**Морской status: 3/3 references done.**

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

### Reference 2 — "Фаина и Роман" invitation card
**Studied:** deep navy blue background, gold stars, crescent moon, gold thread/dot
constellation lines — a celestial night-sky variant of the dark-luxury mood,
distinct from Reference 1's crimson-floral take.
**Prompt:** `moody luxury wedding decoration, gold stars and crescent moon,
delicate gold constellation lines, deep navy blue night sky accent, jewel-tone flat
vector illustration, isolated on transparent background, no text, colorful`
**Saved as:** `luxury-color-stars.svg` — came back as a full decorative square
frame (garland strings + stars along all four edges, moon in the center) rather
than a corner accent; kept as-is since it's a strong, usable frame element.

### Reference 3 — "Вячеслав и Александра" invitation card
**Studied:** black background, metallic gold autumn oak leaves cascading across
the card — a botanical (not floral, not celestial) take on the dark-luxury mood.
**Prompt attempt 1 (issue):** `moody luxury wedding decoration, metallic gold
autumn oak leaves cascading cluster...` — came back desaturated/pale grey despite
"metallic gold" and "colorful" in the prompt (same failure mode as the coastal
category's Reference 1).
**Fix that partially worked:** rewrote the prompt to drop "wedding decoration"'s
usual template and lead with the color instruction, added an explicit negative
prompt (`black and white, monochrome, grayscale, sepia, desaturated, pale, faded,
washed out, light gray, cream, beige, white outline only, line art only, no
color`). Result: branch and acorns rendered in true gold/amber tones; the leaves
themselves stayed pale grey. Accepted as a legitimate two-tone look (gold
branch/acorns, grey-green leaves) rather than attempting a 4th regeneration.
**Prompt (final):** `wedding decoration, vivid metallic gold foil oak leaf branch
with acorns, rich amber and bronze gold gradient, luxury flat vector illustration,
isolated on transparent background, no text, saturated gold colors, not gray, not
white, not pale` + negative prompt above
**Saved as:** `luxury-color-leaves.svg`

**Тёмный фон / Luxury status: 3/3 references done.**

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

### Reference 2 — "Даниэль и Ирина" invitation card
**Studied:** a rustic stone archway with blush pink climbing roses trailing over
it — an architectural (not purely botanical) provence motif, distinct from
Reference 1's hanging wisteria.
**Prompt:** `provence wedding decoration, blush pink and rose climbing florals
over a rustic stone archway corner, soft green leaves, romantic watercolor style
botanical illustration, flat vector, isolated on transparent background, no text,
colorful`
**Saved as:** `provence-color-archway.svg` — one of the most detailed/successful
generations in the whole batch, close match to the reference on first try.

### Reference 3 — "Жанна и Марат" invitation card
**Studied:** a full lavender-field landscape scene — rolling hills, a single tree,
a small rustic stone cottage — the classic "Provence countryside" motif, distinct
from both prior references (this one is a landscape/scene, not a floral spray or
architectural detail).
**Prompt:** `provence wedding decoration, lavender field with a small rustic stone
cottage silhouette, rolling hills, soft purple and green watercolor style
illustration, flat vector, isolated on transparent background, no text, colorful`
**Saved as:** `provence-color-lavender.svg` — composition is excellent (tree,
cottage, rolling lavender rows) but came back in a muted mauve-grey palette
rather than vivid purple; accepted as-is since it reads as an elegant, quieter
illustration style consistent with several other assets in this library (e.g.
`boho-color-lineart.svg`), not re-attempted for saturation.

**Прованс status: 3/3 references done.**

---

## Пионы (peony)

### Reference 1 — "Макар и Дарья" invitation card
**Studied:** deep burgundy and wine-red peonies with sage-green eucalyptus, dark
moody bouquet cluster.
**Prompt:** `peony wedding decoration, deep burgundy and wine red peonies, sage
green eucalyptus leaves, elegant flat vector illustration, isolated on
transparent background, no text, colorful`
**Saved as:** `peony-color-burgundy.svg`

### Reference 2 — "Татьяна и Алексей" invitation card
**Studied:** pure white peonies, soft green leaves — the elegant/pure end of the
peony category, distinct from Reference 1's dark moody bouquet.
**Prompt:** `peony wedding decoration, pure white peonies, soft green leaves,
delicate elegant flat vector illustration, isolated on transparent background,
no text, colorful`
**Saved as:** `peony-color-white.svg`

### Reference 3 — "Амур и Ольга" invitation card
**Studied:** warm terracotta and peach peonies with golden autumn-toned leaves —
a warm autumnal variant, distinct from both prior references' cool/neutral
palettes.
**Prompt:** `peony wedding decoration, warm terracotta and peach peonies, golden
autumn leaves, elegant flat vector illustration, isolated on transparent
background, no text, colorful`
**Saved as:** `peony-color-terracotta.svg`

**Пионы status: 3/3 references done.**

---

## Мраморный (marble)

### Reference 1 — "Валерий и Наталия" invitation card
**Studied:** blue-grey marble texture background with thin gold veining — this
category is almost entirely full-bleed marble-texture backgrounds (like Морской),
not small motifs, so translating it into an isolated decorative element required
picking a concrete subject rather than "abstract marble texture."
**Prompt attempts 1-5 (issue, not resolved cleanly):** every attempt to generate an
isolated "marble texture" shape or frame — geometric corner, oval gem, gold arch
frame — came back as a literal building/architecture illustration (a Taj-Mahal-like
domed structure, a glass conservatory/gazebo) or an unrelated object (a monstera
leaf on a crystal, a nautilus shell), never actual marble stone texture. "Marble"
+ "geometric"/"frame"/"arch" reliably triggered architectural associations in this
model; dropping those words didn't fix it either.
**Fix that worked (pivot, not a fix):** abandoned the "abstract marble texture"
concept and generated a concrete, different but adjacent subject instead — an
agate/geode slice (concentric banded rings, a mineral cross-section) with a gold
botanical sprig laid over it. This is a real, commonly-used motif in the same
"stone luxury" wedding-stationery aesthetic, and Recraft rendered it reliably on
the first real attempt.
**Prompt (final):** `wedding decoration, blue-grey agate geode crystal cluster
with gold accents, elegant flat vector illustration, isolated on transparent
background, no text, colorful`
**Saved as:** `marble-color-geode.svg`

**Мраморный status: 1/3 references done — only the agate/geode pivot succeeded;
the other 2 references for this category are not yet attempted. Revisit with a
different strategy (e.g. try Recraft's Style explorer for an existing "marble
texture" preset instead of free-form prompting) before continuing this category.**

---

## Восточный (oriental)

### Reference 1 — Ажурный (openwork lace) invitation cards (category mood — several
cards in this style browser share the same intricate white lace medallion motif,
so this was a style study rather than one specific couple's card).
**Studied:** intricate white lace/doily circular medallion, dense symmetric
mandala-like pattern, very fine detail.
**Prompt:** `oriental wedding decoration, intricate white lace mandala medallion
pattern, ornate circular doily design with gold center accent, elegant flat vector
illustration, isolated on transparent background, no text, colorful`
**Saved as:** `oriental-color-mandala.svg` — excellent first-try match, subtle
gold center accent as requested.

### Reference 2 — Islamic geometric pattern (category mood, Ажурный/Восточный
overlap — several cards use gold-on-cream geometric tile motifs).
**Studied:** deep green and gold 8-pointed star geometric medallion, arabesque
interlocking pattern.
**Prompt attempt 1 (issue):** including "mihrab arch frame" in the prompt made
Recraft generate a literal mosque illustration (dome, minaret, crescent moon) —
same architecture-drift failure mode as the Marble category's "arch"/"frame"
prompts. Real religious-building imagery isn't an appropriate generic decorative
asset, so this result was discarded (not saved).
**Fix that worked:** dropped "arch"/"mihrab" entirely, described the geometric
star pattern directly instead.
**Prompt (final):** `oriental wedding decoration, geometric star pattern medallion
in gold and deep green, intricate arabesque design, flat vector illustration,
isolated on transparent background, no text, colorful`
**Saved as:** `oriental-color-star.svg`

### Reference 3 — "Ангелина и Вячеслав" invitation card
**Studied:** East Asian (Chinese/Japanese) sub-style — red paper lanterns, gold
pagoda-roof architecture, red color scheme, cherry-blossom-adjacent florals. A
distinctly different Восточный sub-theme from the Islamic/Central-Asian cards
above (this category spans multiple "Eastern" traditions).
**Prompt:** `east asian wedding decoration, red paper lantern with chrysanthemum
and peony flowers, gold accents, elegant flat vector illustration, isolated on
transparent background, no text, colorful`
**Saved as:** `oriental-color-lantern.svg` — lanterns rendered mostly white/grey
with red caps and tassels rather than fully red paper, but the cherry-blossom
branch with gold flower centers is lovely; kept as-is.

**Восточный status: 3/3 references done.**

---

## Рустик (rustic)

### Reference 1 — category mood card (delicate dried wildflower cluster with
thin-line monogram — a common rustic motif across several cards in this style).
**Studied:** small white daisies/cosmos, thin stems, baby's-breath-style sprigs,
very sparse and airy composition.
**Prompt:** `rustic wedding decoration, delicate dried wildflowers cluster, small
daisies and cosmos, thin stems, elegant flat vector illustration, isolated on
transparent background, no text, colorful`
**Saved as:** `rustic-color-wildflowers.svg` — clean transparent background,
excellent match.

### Reference 2 — category mood (eucalyptus greenery spray, common across many
Рустик cards).
**Studied:** cascading soft sage-green eucalyptus leaves.
**Prompt:** `rustic wedding decoration, cascading eucalyptus greenery spray, soft
sage green leaves, elegant flat vector illustration, isolated on transparent
background, no text, colorful`
**Saved as:** `rustic-color-eucalyptus.svg` — came back as a full tied bridal
bouquet (roses + eucalyptus) rather than a loose greenery spray, in a pale
desaturated grey-green palette; kept as-is, consistent with other quiet-palette
pieces in this library.

### Reference 3 — "Олег и Лидия" invitation card
**Studied:** golden wheat stalks and dried pampas grass, warm autumn palette.
**Prompt:** `rustic wedding decoration, golden wheat stalks and dried pampas
grass bundle, warm amber and honey tones, elegant flat vector illustration,
isolated on transparent background, no text, colorful`
**Saved as:** `rustic-color-wheat.svg` — same "tied bundle → opaque background
blob baked into the vector" issue as the coastal anchor (`coastal-color-badge.svg`,
see Морской section): every one of the 4 variants generated for this prompt had a
pale beige blob behind the wheat sheaf. Accepted as a recurring model quirk for
tied-bouquet compositions specifically (not retried further) rather than a
one-off; picked the cleanest-looking variant of the 4.

**Рустик status: 3/3 references done.**

---

<!-- Next: bring each category above up to 3 references, then move to remaining
categories (Пионы, Мраморный/vintage, Восточный, Рустик, Ажурный, etc.) -->
