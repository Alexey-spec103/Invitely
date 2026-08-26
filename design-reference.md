# Design reference — weddingpost.ru published invitation

Source: a live, publicly-published invitation page on weddingpost.ru (no auth
required to view). Captured via `getComputedStyle()` on the rendered page —
**not** their source files, admin panel, or any private system.

This file records only numeric/visual design parameters (colors, type scale,
spacing, radii, shadows) for design inspiration when refining Invitely's own
themes. It intentionally excludes: any photo, any copy/wording, any asset
URL, and any personal information about the real couple whose invitation was
used as the reference sample.

Note on precision: this builder renders each block inside a container with a
responsive `transform: scale(...)` (measured at 1.45x on this render), so the
exact decimal pixel values below are specific to this viewport/zoom and
should be read as **relative proportions**, not literal spec numbers to
copy verbatim.

---

## Palette (site-wide)

| Role | Value |
|---|---|
| Page background | `rgb(239, 240, 245)` — cool off-white, with a very subtle repeating botanical line-art texture (low-contrast leaf/branch line art, tone-on-tone) |
| Primary text | `rgb(0, 0, 0)` for headings, `rgb(51, 51, 51)` for body/UI text |
| Card/panel background | `rgba(255, 255, 255, 0.87)` — white, slightly translucent over the page texture |
| Muted/secondary text | `rgb(128, 128, 128)` |
| Confirmed-RSVP accent (green) | `rgb(60, 118, 61)` |
| Info/CTA accent (teal-blue) | text `rgb(47, 72, 88)`, border `rgba(129, 193, 215, 0.75)` |
| Gold accent (star marker) | `rgb(206, 162, 22)` |
| Teal accent (diamond marker) | `rgb(0, 127, 170)` |
| Footer background | `rgb(202, 216, 192)` — soft sage green |

---

## Hero section

- Layout: two-column — large monogram-style single letters (couple's
  initials) flanking a portrait photo; names + date + "waiting for you"
  label stacked to one side.
- Monogram letters: `Patriciana` (display script), `60.5px` / `86.5px`
  line-height, weight 400, color `rgb(0,0,0)`.
- Date line ("16 июля 2026"): `TildaSans-R`, `14.8px`, weight 400,
  letter-spacing `+2.97px` (wide tracking), line-height `22.3px`, color
  white (rendered over the photo/dark area).
- Eyebrow label ("ЖДЕМ ВАС"): `TildaSans-R`, `12.6px`, weight 400,
  letter-spacing `+2.51px`, uppercase by content (not `text-transform`),
  color white.
- Couple names: `TildaSans-R`, `12.6px`, weight 400, letter-spacing
  `+2.51px`, line-height `25.1px` (2x font-size — generous), color black.
- No border-radius, no box-shadow anywhere in this section — flat,
  editorial layout relying on whitespace and type contrast rather than
  card chrome.

## Letter section

- Rendered as a white card floated over the page's textured background:
  background `rgba(255,255,255,0.87)`, padding `~65px` all sides (scaled;
  proportionally generous — roughly 4.5x the body font-size), **no
  border-radius, no box-shadow** — a flat sheet, not a rounded card.
- Outer wrapper adds `70px` vertical padding around the card itself, so
  the card reads as an inset "page" floating in a large margin.
- Heading ("Дорогой Гость!"): `Patriciana` script, `26.3px`, line-height
  `39.4px` (1.5x), centered.
- Body copy: `TildaSans-R`, `17.1px` down to `14.9px` depending on block,
  line-height ~1.43x font-size, centered, black.
- Pull-quote line: `Betmo` script, `34.3px`, line-height equal to
  font-size (tight), centered.
- Sub-headings ("ПОЖЕЛАНИЯ ПО ПОДАРКАМ", "ПРИМЕЧАНИЕ", "ПОДТВЕРЖДЕНИЕ"):
  `Patriciana` script, `22.8px`, line-height `34.3px` (1.5x), some with
  slight negative letter-spacing (`-1.14px`).
- Closing line ("Ждем Вас!"): `Betmo` script, `34.3px`, line-height
  `48.9px` (1.43x).
- RSVP submit button ("Подтвердить"): `10px` border-radius, padding
  `6px 12px`, weight 600, `2px` border.
- Guestbook submit button ("Отправить"): pill-shaped, `26px`
  border-radius, padding `8px 18px`, `1px` border in the teal accent,
  transparent background, soft ambient shadow
  (`0 8px 20px rgba(102,170,195,0.3)`) — the one section-native button
  with real shadow/glow, functioning as the section's primary CTA.
- Gift-amount chips: plain text list items, `13.3px`, `Montserrat`,
  color `rgb(30,31,40)`, left-aligned, no visible chip background —
  understated, list-style rather than pill/button style.

## Timeline section

- Heading ("Расписание"): `Patriciana` script, `45.7px`, line-height
  `79.9px` (1.75x — very open).
- Timeline body wrapped in a translucent panel: background
  `rgba(255,255,255,0.5)` (lighter than the Letter card), padding
  `60px 0 15px` (top-heavy, no side padding — content likely inset by a
  parent container instead).
- Row time label ("12:00"): `Annabelle` script, `19.2px`, line-height
  `28.8px` (1.5x).
- Row title ("Торжественная регистрация"): `Mon-amour` script, `18.3px`,
  same `28.8px` line-height.
- Row subtitle/venue: `Mon-amour` script, `16.0px`, muted gray
  `rgb(128,128,128)`, same line-height.
- Row note/detail text: `Philosopher` (a different serif), `19.2px`.
- Small icon markers (star `★`, diamond `◆`) used inline as bullet/status
  glyphs at `8–16px`, colored per marker type (gold star, teal diamond)
  rather than via an icon sprite.
- No card border-radius or box-shadow — same flat-panel language as the
  Letter section, just lower-opacity background.

## Map section

- On this sample the map is a plain, full-width embedded Yandex Maps
  widget with no custom heading/address card layered on top (the couple
  didn't fill in a custom venue label) — so there's no bespoke card
  chrome to report here; it sits directly on the white page background,
  full-bleed, no border-radius.
- Immediately below the map, the page ends in the sage-green footer
  (`rgb(202,216,192)`) with the platform's own logo/credit line.

---

## Cross-section observations

- **No rounded corners or shadows anywhere except one button.** Every
  section container (`Letter`, `Timeline`) is a flat rectangle;
  the sole exception is the Letter section's guestbook "Отправить"
  button (pill + soft glow). This is a much flatter, more editorial
  visual language than Invitely's current card-heavy dashboard aesthetic
  — cards here read as "paper sheets," not "app panels."
- **Heavy reliance on script/display webfonts for headings** (Patriciana,
  Betmo, Annabelle, Mon-amour) paired with one plain sans (`TildaSans-R`)
  for body copy and `Montserrat` for interactive UI chrome — a clear
  two-tier type system (decorative for content, functional sans for
  controls) worth mirroring conceptually even with different font
  choices.
- **Generous line-height ratios** (1.43–1.75x font-size) throughout
  headings — a consistent "airy" rhythm rather than tight leading.
- **Letter-spacing used deliberately** on short uppercase/label text
  (eyebrow labels, names) but never on body paragraphs.
