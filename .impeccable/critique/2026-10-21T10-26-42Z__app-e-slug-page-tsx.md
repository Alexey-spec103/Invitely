---
target: guest-facing public site (app/e/[slug])
total_score: 28
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\AP309\\dev\\invitely\\app\\e\\[slug]\\page.tsx"
target_fingerprint: "sha256:fe28143c2f4c6d328289cc0b3984a9bed79b917b7ff3ed6ec4e9299ed1812d8e"
target_path: "C:\\Users\\AP309\\dev\\invitely\\app\\e\\[slug]\\page.tsx"
timestamp: 2026-10-21T10-26-42Z
slug: app-e-slug-page-tsx
---
# Design Critique: Invimbo Guest-Facing Site

Method: dual-agent (A: design review · B: detector/browser evidence)

## Scope note

The chosen public preview routes (`/preview/[themeId]`) render **Hero only** — confirmed in source (`app/preview/[themeId]/page.tsx` renders nothing but `<HeroSection>`). The deterministic CLI scan (`impeccable detect`) did cover the real, full source trees (`app/e/[slug]` and all of `components/sections` — Letter, Timeline, Map, RSVP, Guestbook, etc.), so static-analysis coverage is complete. But the *live browser* evidence (both the detector's visual pass and the design reviewer's visual pass) only ever saw Hero in isolation — no SiteHeader, no scroll, no RSVP form, no Guestbook, no EnvelopeReveal rendered on screen. Everything below is Hero-verified-live; everything downstream of Hero is source-code-informed only and flagged inline wherever it's the basis for a finding.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | RSVP has pending/"taking longer" messaging (source, not seen live); Hero has no loading affordance for heavy background art |
| 2 | Match System / Real World | 3 | Envelope-opening ritual, warm RSVP copy, category-appropriate decor metaphors |
| 3 | User Control and Freedom | 3 | Nav closes on Escape/scroll, skippable envelope reveal, editable prior RSVP answer |
| 4 | Consistency and Standards | 3 | Theme CSS vars used consistently; undercut by RSVP's one-size-fits-all decoration breaking the per-category convention used everywhere else |
| 5 | Error Prevention | 3 | Honeypot + submit-timing anti-spam, party-size clamping, required-field checks |
| 6 | Recognition Rather Than Recall | 4 | A returning guest never sees a blank RSVP form again (server lookup + localStorage) — solves a real repeat-visit pain point |
| 7 | Flexibility and Efficiency | 3 | One-tap accept/decline for personalized-link guests vs. full form for others |
| 8 | Aesthetic and Minimalist Design | 3 | Hero compositions are purposeful; two of four demo photos read as placeholder-ish (see Priority Issues) |
| 9 | Error Recovery | 3 | Inline errors move focus to the actual broken field (source, not fired live) |
| 10 | Help and Documentation | n/a | Consumer persuade/experience site — self-explanatory flow is correct here, not a gap |
| **Total** | | **28/36** | **Good** |

## Design Specificity Verdict

**LLM assessment:** Strong before anything else was considered. Four Hero compositions inspected (romantic-rosewater, vintage-rosewood, dark-onyx-rose, minimal-ink) are structurally different devices — an ornate Victorian cameo, a gothic stone archway with a candle, an oversized typographic monogram with a small photo, an editorial photo-bleed layout — not palette swaps of one template. That's genuinely hard to fake across a 100+ theme catalog. The verdict softens past Hero: RSVP (the one section every guest must act on) uses a single undifferentiated decorative flourish across every theme category, the opposite instinct from the rest of the system's own documented per-category decor convention.

**Deterministic scan:** `impeccable detect --json "app/e/[slug]" "components/sections"` — exit code 0, zero findings across 166 scanned files, full real source trees (not just Hero). No suppressing config present, so the zero is real, not an artifact of exclusions.

**Visual overlays:** Browser-injected detector ran cleanly on all three Hero pages tested (romantic-rosewater, vintage-rosewood, dark-onyx-rose) — "No anti-patterns found" on every one. No user-visible overlay persists after the run (live server was stopped); this is a console-log-only confirmation, not a lingering annotation layer.

## Overall Impression

The Hero layer is the best-executed part of this product's design: four genuinely different compositional ideas, not a reskin factory. The gut-check problem is that a Hero is also where the weakest content (demo photos) lives most visibly, and two of the four themes inspected have a demo photo that reads as broken or placeholder rather than deliberate — which undercuts the compositional craft directly underneath it. The single biggest opportunity: audit every theme's demo/stock photo for "does this read as a person/couple/wedding scene in under a second," since that photo is the literal first thing every shopper, QR-scanner, and guest sees.

## What's Working

- **Hero compositional range.** Cameo frame, gothic arch, oversized typographic monogram, editorial bleed are structurally different devices, not recolors of one layout — confirmed across 4 themes, the hardest thing to fake in a large catalog.
- **RSVP recall + one-tap flow** (source-verified). Server-side lookup for personalized guests and a localStorage fallback for self-service guests mean a returning visitor is never shown a blank form again, combined with honeypot/timing anti-spam and focus-steering validation on errors — more careful engineering than most wedding-site templates bother with.
- **EnvelopeReveal** (source-verified). Personalized, skippable, respects `prefers-reduced-motion`, shown once per browser — a deliberate peak-of-journey moment at the very start of the experience, not an afterthought.

## Priority Issues

**[P1] vintage-rosewood's demo photo reads as broken, not deliberate**
Why it matters: the Victorian cameo frame is an ornate medallion clearly designed to hold a portrait, but displays a crumpled kraft-paper texture (`images.unsplash.com/photo-1763030861291-b7e65ae261c9`, hardcoded in `lib/themes/previewMedia.ts:129`). It loads fine (HTTP 200) — it just doesn't read as a photo of people, which is what this exact image feeds into the "scan to preview" QR flow shoppers use to evaluate the theme.
Fix: swap in an actual portrait-style stock photo that matches the frame's intent.
Suggested command: `/impeccable polish`

**[P1] Mobile Hero buries the couple's identity below the fold (confirmed live, romantic-rosewater, 390px viewport)**
Why it matters: the first full screen on mobile is entirely a black-and-white stock table-setting photo — no names, no date, no monogram until the guest scrolls. Given this codebase's own comments note invites are opened on phones via WhatsApp/Telegram as the dominant real case, this is a cold, unbranded first impression at exactly the moment that matters most.
Fix: cap the mobile photo's height so names + date land in the first viewport, or reorder photo-after-identity on narrow widths.
Suggested command: `/impeccable adapt`

**[P2] minimal-ink's Hero photo is ambiguous, not clearly intentional**
Why it matters: a blurred gray/concrete-textured circle sits between the couple's names (`photo-1712730324756-e4879e9c9b11`). It could be a deliberate "ink blot" motif matching the theme's name, or the same demo-photo mismatch as vintage-rosewood above — the ambiguity itself is the problem, since a shopper can't tell the difference either.
Fix: either make the "ink blot" motif legibly deliberate (e.g. visible texture/shape that reads as intentional), or replace it with a real photo.
Suggested command: `/impeccable clarify`

**[P2] RSVP uses one generic decoration across every theme category (source-verified, not seen live)**
Why it matters: `decorMotifs.ts` documents a per-category decoration convention used throughout the rest of the system, but `SimpleForm.module.css` uses one shared `corner-flourish.svg` tinted to the theme accent color regardless of category. The single section every guest is required to act on is the least bespoke-looking part of the experience.
Fix: extend the existing category-decor system to the RSVP section.
Suggested command: `/impeccable layout`

**[P3] This critique's own coverage gap (methodology note, not a product flaw)**
The `/preview/*` routes used for live inspection only render Hero — Letter, Timeline, Map, RSVP, Guestbook, SiteHeader, and EnvelopeReveal were evaluated from source only, not visually confirmed. Flagging so the scope of "verified" vs. "source-derived" in this report stays honest. A follow-up pass through a real published test event (the full `/e/[slug]` journey) would close this gap.

## Persona Red Flags

**Casey (distracted mobile user):** romantic-rosewater's entire first mobile screen is an unbranded stock photo with no names — nothing anchors "this is an invite from someone I know" in the few seconds a distracted scroller gives it before swiping past.

**Jordan (confused first-timer):** on vintage-rosewood and minimal-ink, the one photographic element in the Hero looks like a stalled or broken image load rather than a deliberate choice — a first-timer could reasonably assume the page didn't finish loading.

**Sam (accessibility-dependent user):** could not be verified live this pass. Source shows real effort (sr-only labels on dynamic fields, `aria-invalid`/`aria-describedby`, `role="alert"`, Escape/scroll-dismissible menu) — noted as an unverified positive, not a confirmed pass. Contrast, focus order, and landmark structure remain untested.

## Minor Observations

- dark-onyx-rose's background is a warm medium charcoal, not true black — pleasant, but "Onyx" over-promises depth.
- The gothic-arch candle photo in dark-onyx-rose is well art-directed (warm flame against cool gray) — the one photo of the four that reads as fully intentional.
- romantic-rosewater's photo bleeding off the viewport's bottom-right is a real, deliberate editorial crop (confirmed via CSS, not a layout bug).
- The `/preview` page's sticky "Log in / Use this style" bar is useful shopper chrome but isn't part of the real guest experience.

## Questions to Consider

- If RSVP is the one moment every guest must act on, why is it the only section still using one undifferentiated decoration — what would it look like with the same bespoke-per-category treatment Hero already gets?
- Given invites are opened on phones via WhatsApp/Telegram by the codebase's own admission, should any theme's mobile Hero ever lead with an unbranded photo?
- Should there be a standing check — automated or just a habit — that flags a theme's demo photo as "doesn't read as a person/couple/wedding scene" before it ships?
