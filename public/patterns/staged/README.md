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
| `oriental-color-mandala.svg` | Ажурный category mood — white lace medallion | oriental wedding decoration, intricate white lace mandala medallion pattern, ornate circular doily design with gold center accent |
| `oriental-color-star.svg` | Islamic geometric pattern mood | oriental wedding decoration, geometric star pattern medallion in gold and deep green — avoided "arch"/"mihrab" wording, which generated a literal mosque instead |
| `oriental-color-lantern.svg` | "Ангелина и Вячеслав" — East Asian lanterns + cherry blossom | east asian wedding decoration, red paper lantern with chrysanthemum and peony flowers, gold accents |
| `rustic-color-wildflowers.svg` | Рустик category mood — dried wildflower cluster | rustic wedding decoration, delicate dried wildflowers cluster, small daisies and cosmos, thin stems |
| `rustic-color-eucalyptus.svg` | Рустик category mood — eucalyptus spray | rustic wedding decoration, cascading eucalyptus greenery spray — came back as a full tied bouquet, pale grey-green |
| `rustic-color-wheat.svg` | "Олег и Лидия" — golden wheat + pampas grass | rustic wedding decoration, golden wheat stalks and dried pampas grass bundle — has the same tied-bundle background-blob quirk as `coastal-color-badge.svg` |
