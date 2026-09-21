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

**2026-09-17 rollout:** promoted a further batch to `color/` and wired them into
`lib/themes/decorMotifs.ts` for the `coastal`, `dark`, `vintage`, and `botanical`
site categories (extending the `romantic`/`boho`/`rustic` coverage from the pilot).
Picked by matching each staged category's *studied background color*, not its
weddingpost.ru name, against this site's actual `ThemeCategory` background tokens:
- `coastal` <- `coastal-color-spray.svg` + `coastal-color-shell.svg` (dropped
  `coastal-color-badge.svg` -- its opaque circular backdrop is a different
  technique from the other two, and this site's corner-pair slot needs one
  consistent motif, not a mixed set).
- `dark` <- the "Тёмный фон / Luxury" batch's `luxury-color-peonies.svg` +
  `luxury-color-leaves.svg` (near-black-bg study matches this site's `dark`
  category, not its own `luxury` category -- see decorMotifs.ts comment) +
  `cosmic-color-constellation.svg` for the small cap slot, NOT
  `luxury-color-stars.svg` -- that one has an opaque navy `#283950` rectangle
  baked into the vector as a background (confirmed by inspecting the raw SVG),
  which rendered as a visible box rather than a floating accent.
- `vintage` <- `ajour-color-floral.svg` + `oriental-color-star.svg` (not
  `oriental-color-mandala.svg` -- confirmed low-contrast live, "fully pale
  monochrome" per this file's own note below).
- `botanical` <- `watercolor-color-cornflower.svg` +
  `watercolor-color-eucalyptus.svg`, NOT the peony set -- `peony-color-terracotta`/
  `-burgundy` read as mostly white/cream flowers with small color accents
  (confirmed low-contrast live on a pale botanical background, same failure
  mode the romantic/rustic contrast-fixes below describe), while the
  cornflower's genuine navy-blue saturation reads clearly against botanical's
  pale green/cream backgrounds.
- `luxury` deliberately left unmatched -- that category's own 10 themes split
  roughly evenly between near-black and pale-blush backgrounds, so no single
  fixed-palette asset reads legibly across all of them; the safe accent-tinted
  mask fallback stays for every theme in it.

**2026-09-17, new category:** `marble` added as its own `ThemeCategory` (not
just new decor on an existing one) -- 6 new theme files
(`lib/themes/marble-*.ts`), each with a palette picked to pair with the
Мраморный batch's own colors from the start rather than retrofitted for
contrast after the fact. `marble-color-geode.svg` + `marble-color-teal.svg`
promoted to `color/` and wired into every decorMotifs.ts slot (both are
moderate-contrast agate/crystal illustrations, confirmed live to read
clearly on both the pale AND near-black marble theme instances -- unlike
`luxury`, this category didn't need decor left unmatched). `marble-color-dark.svg`
not used -- redundant with the geode/teal pair once palettes were chosen to
fit them, and its own asset-selection story (LOG.md) is weaker (a random
dancer silhouette misfire before the final prompt, "mostly pale/white"
result). A genuine marble-veining page texture
(`public/patterns/texture/marble-slab-on{light,dark}.svg`) was built for it
too, using the same per-theme-lightness-adaptive pick as `luxury`'s texture
(see `backgroundTexture.ts`).

**2026-09-17, second new category:** `cosmic` added the same way -- 6 new
theme files (`lib/themes/cosmic-*.ts`), all near-black (unlike `marble`,
the Космический batch's own colors -- muted charcoal/grey with a soft gold
or silver -- read as washed-out on anything but a dark base, so this
category didn't need the light/dark split; no `overlay` variant in its
texture entry). `cosmic-color-stars.svg` (an arched-window star/moon
motif) + `cosmic-color-zodiac.svg` (a capricorn/goat outlined in gold
constellation lines, kept deliberately per this file's own earlier note on
why -- see the Космический section above) promoted to `color/` and wired
into every decorMotifs.ts slot; both confirmed live with clean contrast and
no text overlap. `cosmic-color-constellation.svg` NOT reused here --
already claimed by `dark`'s own `CAP_DECOR` entry, and reusing one asset
across two different categories would blur the "one motif per category"
rule the whole decor system exists to keep. The bespoke texture
(`public/patterns/texture/cosmic-nightsky-fleck.svg`) needed a real tuning
pass live -- the first attempt (0.4 max alpha) washed the near-black bg out
to a flat medium grey, visibly losing the "midnight" mood; dropped to 0.14
and reconfirmed live before treating it as done. Worth remembering for any
future all-dark-category texture: the lightening-fleck technique is far
more alpha-sensitive on a near-black base than the darkening version is on
a pale one -- start low and increase, not the other way round.

**2026-09-17, third and fourth new categories:** `peony` and `provence`
added, both 6 theme files. Both categories' own staged assets share the
Пионы/Прованс batches' `#E4E5DF` pale base fill that caused the earlier
`botanical`/`CAP_DECOR` low-contrast finding (see that comment above) --
this time the fix was applied at design time instead of discovered live:
every new theme's `--theme-bg` was deliberately picked noticeably deeper/
richer than a stark pale tone (e.g. `#E8CFC7`, `#D9D3E0`, not `#F5E9E4`-
range), confirmed live on `peony-blush-burgundy` and
`provence-lavender-sage` with clean, well-defined decor and no overlap on
the first attempt -- no contrast-retrofit cycle needed this time.
`peony-color-burgundy.svg` + `peony-color-terracotta.svg` used (not
`peony-color-white.svg`, still avoided as too monochrome-pale to be worth
the risk); `provence-color-wisteria.svg` + `provence-color-archway.svg`
used (`provence-color-archway.svg` in particular is an outstanding result,
confirmed live -- a genuine stone-archway-with-climbing-roses composition);
`provence-color-lavender.svg` skipped -- its own muted grey palette (per
this file's Прованс section above) made it a weaker fit than the other two,
not worth the extra design effort for a third asset when two already cover
CAP_DECOR + CORNER_PAIR_DECOR well.

## Assets

| File | Reference mood (weddingpost.ru) | Prompt summary |
|---|---|---|
| `romantic-color-wreath.svg` | "Иван и Валерия" — burgundy/wine roses, sage eucalyptus | delicate watercolor floral wreath, burgundy and wine-red roses, sage green eucalyptus |
| `romantic-color-frame.svg` | "Кирилл и Анна" — thin gold geometric frame, deep rose/white roses | **Contrast-fixed 2026-09-17** (see LOG.md) — regenerated with deep dusty rose/burgundy roses instead of all-pale; original prompt: romantic wedding decoration, thin gold geometric frame corner, blush pink and soft white roses, sage green eucalyptus leaves |
| `romantic-color-hydrangea.svg` | "Кирилл и Анна" — burgundy rose + white hydrangea spray | **Contrast-fixed 2026-09-17** (see LOG.md) — regenerated with dusty rose/mauve roses instead of all-white; original prompt: romantic wedding decoration, all-white and blush cream roses and hydrangea clusters, soft sage green leaves, elegant arching botanical spray |
| `boho-color-spray.svg` | "Андрей и Марина" — dried pampas grass, terracotta dried florals | boho wedding decoration, dried pampas grass plumes, terracotta and rust dried florals, white rose |
| `boho-color-lineart.svg` | Бохо category — delicate line-art dried fern + cosmos | boho wedding decoration, delicate dried fern leaves and white cosmos flowers, thin brown curved line accent, sparse line-art |
| `boho-color-frame.svg` | "Константин и Мария" — gold geometric frame, pampas grass | boho wedding decoration, thin gold geometric angular frame corner, white cosmos flowers, tan and brown dried pampas grass plumes |
| `boho-color-vine-tall.svg` | weddingpost.ru "Андрей и Анна" mockup — full-height wisteria vine framing the whole viewport, not a corner accent | boho wedding decoration, tall vertical vine border running top to bottom, dried pampas grass plumes cascading downward, terracotta and rust dried florals, cream and tan tones, small white rose accents, elongated full-height climbing garland composition — 1:2 portrait aspect, for a full-height side-frame instead of a small icon |
| `coastal-color-spray.svg` | "Морской" category — soft blue/teal ink, sandy tones | wedding corner decoration: dusty-blue starfish, sandy-tan seashell, sage seaweed sprig, pale coral accents (needed a negative prompt — "black and white, monochrome, grayscale" — the model defaults to muted/desaturated for this subject otherwise) |
| `coastal-color-shell.svg` | "Алексей и Анастасия" — minimalist blue line-art shell emblem | coastal wedding decoration, delicate blue line-art seashell emblem, thin scattered dot accents, minimalist |
| `coastal-color-badge.svg` | nautical anchor motif (own composition) | coastal wedding decoration, small navy blue anchor icon, scattered coral starfish and white seashells, sage seaweed sprig — **has an intentional opaque circular badge background, not transparent** (see LOG.md) |
| `luxury-color-peonies.svg` | "Леонид и Милана" — crimson peonies + gold on near-black | moody luxury wedding decoration, deep crimson and burgundy peonies, dark emerald green leaves, gold accent branches, jewel-tone |
| `luxury-color-stars.svg` | "Фаина и Роман" — gold stars/moon on navy blue | moody luxury wedding decoration, gold stars and crescent moon, delicate gold constellation lines, deep navy blue — came back as a full frame, not a corner accent |
| `luxury-color-leaves.svg` | "Вячеслав и Александра" — metallic gold autumn leaves on black | vivid metallic gold foil oak leaf branch with acorns, rich amber and bronze gold gradient (needed a strong negative prompt to avoid a pale/grey default — leaves still came out grey-green, branch/acorns are true gold) |
| `provence-color-wisteria.svg` | "Виктория и Денис" — hanging periwinkle/lavender wisteria | provence wedding decoration, hanging wisteria clusters in periwinkle and lavender blue, soft green eucalyptus leaves |
| `provence-color-archway.svg` | "Даниэль и Ирина" — pink roses over a stone archway | provence wedding decoration, blush pink and rose climbing florals over a rustic stone archway corner — one of the strongest results in the batch |
| `provence-color-lavender.svg` | "Жанна и Марат" — lavender field with a stone cottage | provence wedding decoration, lavender field with a small rustic stone cottage silhouette, rolling hills — landscape scene, muted mauve-grey palette rather than vivid purple |
| `peony-color-burgundy.svg` | "Макар и Дарья" — burgundy/wine peonies, dark moody | peony wedding decoration, deep burgundy and wine red peonies, sage green eucalyptus leaves |
| `peony-color-white.svg` | "Татьяна и Алексей" — pure white peonies | peony wedding decoration, pure white peonies, soft green leaves, delicate elegant |
| `peony-color-terracotta.svg` | "Амур и Ольга" — warm terracotta/peach peonies | peony wedding decoration, warm terracotta and peach peonies, golden autumn leaves |
| `marble-color-geode.svg` | "Валерий и Наталия" — blue-grey marble, pivoted to agate/geode | wedding decoration, blue-grey agate geode crystal cluster with gold accents — abstract "marble texture" prompts kept generating literal architecture instead (see LOG.md) |
| `marble-color-dark.svg` | "Антон и Мария" — "ice and fire" dark marble + orange cracks | black and charcoal grey agate geode crystal slice with warm orange and amber veining — first attempt generated a random dancer silhouette instead of veining, needed explicit "no figures/people" |
| `marble-color-teal.svg` | "Михаил и Оливия" — teal marble + gold splash | teal and turquoise agate geode crystal slice with gold splash accents |
| `cosmic-color-stars.svg` | Космический category mood — gold stars/moon | moody luxury wedding decoration, gold stars and crescent moon, deep purple night sky — hardest category so far, ~10 attempts across 3 refs, see LOG.md |
| `cosmic-color-constellation.svg` | own composition — abstract gold constellation | gold lines connecting stars, olive branch, no figures — picked from history after repeated figure/couple misfires |
| `cosmic-color-zodiac.svg` | own composition — zodiac constellation | capricorn/goat outlined in gold stars — kept deliberately since every "constellation" prompt drew an animal regardless of exclusions |
| `ajour-color-beadwork.svg` | "Михаил и Наталья" — gold pearl beadwork curtain | ajour lace wedding decoration, ornate gold pearl beadwork curtain border pattern — accurate composition, no gold color came through |
| `ajour-color-frame.svg` | "Егор и Екатерина" — dark green + white lace frame | ajour lace wedding decoration, elegant white lace border frame, dark emerald green and white — came back as a die-cut lace frame with a bride silhouette, no green came through |
| `ajour-color-floral.svg` | "Карина и Галия" — dense white floral lace border | ajour lace wedding decoration, dense pink and burgundy floral lace border pattern — the one color success in this category |
| `watercolor-color-eucalyptus.svg` | "Артём и Наталья" — eucalyptus wreath | watercolor style, soft translucent eucalyptus wreath, visible brush strokes — first prompt in the library using genuine watercolor-technique wording instead of "flat vector illustration" |
| `watercolor-color-cornflower.svg` | "Алина и Денис" — blue cornflowers + wheat | watercolor style, blue cornflowers and wild wheat stalks, loose brushstroke — best color result, has an unprompted ghosted-flower layering effect |
| `watercolor-color-anemone.svg` | "Алексей и Диана" — loose blue anemone/poppy | loose ink-wash watercolor, blue anemone and poppy flowers — no blue came through but genuinely looser organic linework |
| `oriental-color-mandala.svg` | Ажурный category mood — white lace medallion | oriental wedding decoration, intricate white lace mandala medallion pattern, ornate circular doily design with gold center accent |
| `oriental-color-star.svg` | Islamic geometric pattern mood | oriental wedding decoration, geometric star pattern medallion in gold and deep green — avoided "arch"/"mihrab" wording, which generated a literal mosque instead |
| `oriental-color-lantern.svg` | "Ангелина и Вячеслав" — East Asian lanterns + cherry blossom | east asian wedding decoration, red paper lantern with chrysanthemum and peony flowers, gold accents |
| `rustic-color-wildflowers.svg` | Рустик category mood — terracotta/burgundy wildflower spray | **Contrast-fixed 2026-09-17** (see LOG.md) — regenerated with terracotta/mustard/burgundy tones instead of pale white; original prompt: rustic wedding decoration, delicate dried wildflowers cluster, small daisies and cosmos, thin stems |
| `rustic-color-eucalyptus.svg` | Рустик category mood — eucalyptus spray | **Contrast fix attempted, unresolved** (see LOG.md) — still too pale on rustic's real backgrounds despite several regeneration attempts; not promoted to `color/`, not wired into any component. rustic wedding decoration, cascading eucalyptus greenery spray — came back as a full tied bouquet, pale grey-green |
| `rustic-color-wheat.svg` | "Олег и Лидия" — golden wheat + pampas grass | **Contrast-fixed 2026-09-17** (see LOG.md) — regenerated for a stronger amber wheat-head color; background-blob quirk persisted across every variant (accepted, doesn't hurt contrast). Original prompt: rustic wedding decoration, golden wheat stalks and dried pampas grass bundle — has the same tied-bundle background-blob quirk as `coastal-color-badge.svg` |
