---
target: public guest-facing invitation site (/e/[slug])
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\AP309\\dev\\invitely\\app\\e\\[slug]\\page.tsx"
target_fingerprint: "sha256:61f25e083ad0a6a112ef47b91d310bb30a3fa8bc398ce656965f277071873d4e"
target_path: "C:\\Users\\AP309\\dev\\invitely\\app\\e\\[slug]\\page.tsx"
timestamp: 2026-10-04T12-22-06Z
slug: app-e-slug-page-tsx
---
Method: dual-agent (A: design review · B: detector/browser evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | RSVP error message stays on screen even after the guest fixes the fields |
| 2 | Match Between System and Real World | 4 | Occasion-appropriate language throughout, correct locale/date formatting |
| 3 | User Control and Freedom | 3 | Envelope is skippable, language reversible; no explicit "skip" affordance |
| 4 | Consistency and Standards | 3 | Card/pill/accent system is consistent; nav icons break the illustration language |
| 5 | Error Prevention | 1 | Unpublished sites accept full RSVP input, fail only after submit |
| 6 | Recognition Rather Than Recall | 4 | Sticky labeled nav, pre-filled guest name on personal links |
| 7 | Flexibility and Efficiency of Use | n/a | One-time anonymous-guest persuade surface, no return-user workflow to optimize |
| 8 | Aesthetic and Minimalist Design | 4 | Generous whitespace, one focal element per section |
| 9 | Error Recovery | 1 | No field-level error targeting; typed RSVP content is lost on the publish-gate failure |
| 10 | Help and Documentation | n/a | Appropriate to omit on a persuade surface; inline microcopy carries the load well |
| **Total** | | **23/32** | **Good (72%)** |

## Design Specificity Verdict

**Design review**: This doesn't read as a generic "card builder with copy swapped." The envelope-open ritual (auto-opens after 4.5s or on tap/Enter/Space, respects `prefers-reduced-motion`, remembers per-browser), the genuinely-illustrated botanical line art, RSVP copy that commits to a voice ("Joyfully accepts" / "Regretfully declines"), and a 404 page that stays in character ("This page wandered off somewhere") are real craft signals. Spot-checking a dark art-deco marble theme and a cream botanical theme alongside the live romantic-blush event confirmed genuine range across the catalog, not one palette re-skinned. The one slip: the hamburger nav's section icons are raw platform emoji (🏠💌🗓️📍✅🍽️) sitting directly against hand-illustrated florals and a restrained serif/script system — they read like a to-do app next to custom artwork, a known deliberate trade-off per the code's own comment (parity with a competitor's icon+label nav) that doesn't match the bar the rest of the page sets.

**Deterministic scan**: `impeccable detect` over `components/sections` and `app/e` returned zero findings (engine verified genuine via `engine-probe` and a deliberately-bad test fixture, which also correctly triggered nothing it shouldn't have claimed). The live in-browser detector (injected successfully on 3 of 4 attempts) consistently flagged one anti-pattern: a zero-offset `text-shadow` glow rule (`dark-glow`) on the couple's-names text in `WatercolorBloom.module.css:130`. Reading the source: this is very likely a **false positive** — the code's own comment explains it's a background-colored legibility halo behind long name pairs overlapping wreath artwork, not a decorative glow. One run briefly showed a second, unidentified finding before the tab was closed by concurrent browser activity; it didn't reproduce on the other three runs, so it isn't being treated as confirmed.

## Overall Impression

The emotional design and copy voice are genuinely above the category bar — this doesn't feel AI-template-interchangeable. The single real crack is structural, not cosmetic: a guest can complete the entire RSVP form on a site the host hasn't published yet, and only learns it didn't count after clicking submit. That one gap undercuts an otherwise well-built emotional arc at the worst possible point — the intended peak of the whole guest journey.

## What's Working

1. **RSVP micro-copy treats failure as a conversation, not a rejection** — "We couldn't find '{name}' on the guest list — double-check the spelling, or ask the host" reads human, not like a validation error.
2. **Progressive disclosure on the RSVP form is textbook** — party-size and additional-guest fields only appear after the guest says yes, keeping the binary accept/decline decision uncluttered. The Guestbook section correctly renders nothing at all when empty rather than an awkward blank wall — worth reusing as the pattern everywhere content can be empty.
3. **Theme breadth is real** — an art-deco marble theme and a soft-botanical theme differ enough in mood, palette, and motif to read as a genuine design system, confirmed by both agents independently.

## Priority Issues

- **[P0] Interactive RSVP form is fully usable on an unpublished site, and only fails after submission.** A guest fills every field (name, attendance, party size, allergies, message) and clicks "Send RSVP" before learning "This site isn't published yet… ask your host to publish it." *Why it matters*: this is the single highest-stakes moment in the whole guest journey, and it's where the product currently fails worst, with zero warning in advance. *Fix*: surface a persistent "this invitation isn't live yet" notice before any interactive content renders on an unpublished site — at minimum a banner directly on the RSVP section, not just a post-submit error. *Suggested command*: `/impeccable harden`

- **[P1] RSVP validation doesn't say which field is wrong, and the message doesn't clear once fixed.** The combined message ("Please fill in your name and let us know if you can make it.") stays on screen, unexplained, even after both fields are corrected. *Fix*: clear the error on input change; ideally flag the specific empty field inline. *Suggested command*: `/impeccable clarify`

- **[P1] Typed RSVP content is discarded on the unpublished-site failure, with no recovery offered.** A guest who wrote a message or dietary note gets no "we kept this, try again later" — just a dead end. *Fix*: preserve form state through the failure at minimum; ideally retry transparently once the host publishes. *Suggested command*: `/impeccable harden`

- **[P2] Nav section icons are raw platform emoji, clashing with the page's bespoke illustration style.** Emoji render differently per OS and carry their own cartoon style next to hand-drawn florals. *Fix*: replace with a small theme-tinted line-icon set (single-color SVG using `--theme-accent`) matching the weight of the decorative art. *Suggested command*: `/impeccable typeset`

- **[P3] Free-text schedule "time" field allows malformed output with no structure.** Observed live on the test event: "16:00-22:" renders with a trailing colon and no end time because the host typed it that way, and some Schedule/Timeline entries showed placeholder-quality mixed-language content — almost certainly this specific host's unfinished draft, not a platform defect, but the editor gives no nudge toward a clean format before a guest could see it live. *Fix*: split into explicit start/end time inputs in the dashboard editor, or validate/format on display. *Suggested command*: `/impeccable harden`

## Persona Red Flags

**Jordan (confused first-timer, never used a product like this)**: The envelope and Hero are self-explanatory. The trip point is the RSVP form — Jordan fills name, attendance, allergies, and a message, hits "Send RSVP," and is told the site isn't published, with no earlier signal anything was off. Jordan can't tell if this is their mistake, a broken link, or something to flag to the couple, and "ask your host" assumes a comfort level with pinging the couple about a technical error that many first-time guests won't have.

**Casey (distracted mobile user, one thumb, might get interrupted)**: Single-column scroll and large tap targets suit one-handed phone use well, and progressive disclosure keeps the form short. Casey's risk: no save/draft state if interrupted mid-form — a return visit means re-entering everything from scratch, and would still hit the same unpublished-site wall at the end on this instance regardless.

## Minor Observations

- Console and network: clean on every page load (only expected dev-mode noise — HMR, Vercel Analytics debug). No broken images observed in Hero/Timeline.
- The "Made with Invimbo" watermark badge (Free plan, bottom-left) visually collided with the Next.js dev-mode indicator during this inspection — a localhost-only artifact, worth confirming it has clear breathing room in a real production view.
- Mobile-viewport verification was inconclusive this run — the browser tool's resize reported success but the page never actually reflowed (`window.innerWidth` stayed desktop-width across every attempt). CSS review shows fluid `clamp()` type sizing, explicit mobile breakpoints, and a global `overflow-x: clip` guard against decorative-art bleed, which is reassuring, but this needs a follow-up pass with working device emulation rather than being taken on faith.
- A stale locale cookie from earlier testing caused the inspected session to default to Italian on first load — confirms the geo-IP fallback mechanism works, but worth double-checking the language pill's current-language label is legible/obvious to a guest who lands in an unexpected language.

## Questions to Consider

- Should an unpublished site's direct guest URL hold back interactive content entirely (a "not yet open" holding page) rather than being fully functional-but-silently-failing — or is peekability-before-launch (e.g. sharing a draft with a partner) an intentional product decision worth preserving in some form?
- What if the RSVP success state got the same ceremonial treatment as the envelope-open (a matching motion moment), turning the actual end of the guest's journey into as deliberate a peak as the start?
- Is a per-theme-generated nav icon set (pulled from each theme's own decorative motif library) worth the cost, or does a single shared-but-redesigned line-icon set get most of the benefit for far less effort across 124 themes?
