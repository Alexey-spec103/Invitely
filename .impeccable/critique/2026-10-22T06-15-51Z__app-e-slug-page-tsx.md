---
target: app/e/[slug]/page.tsx
total_score: 25
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\AP309\\dev\\invitely\\app\\e\\[slug]\\page.tsx"
target_fingerprint: "sha256:499088fcdda513ad36cc8da95cc0d212253582099bb20c2ea6946871bf99bfd6"
target_path: "C:\\Users\\AP309\\dev\\invitely\\app\\e\\[slug]\\page.tsx"
timestamp: 2026-10-22T06-15-51Z
slug: app-e-slug-page-tsx
---
Method: dual-agent (Assessment A: isolated sub-agent · Assessment B: isolated sub-agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | RSVP has real pending/"taking longer" states and a success screen; the map section gives no signal whether an empty state is temporary or permanent |
| 2 | Match Between System and Real World | 2 | Map empty-state copy ("Add an address to preview the map") is written in host/editor voice and shown verbatim to guests |
| 3 | User Control and Freedom | 3 | Guests can edit a prior RSVP; no explicit withdraw/undo once submitted (minor) |
| 4 | Consistency and Standards | 4 | Corner-flourish decor, section backgrounds, and typography tokens apply uniformly across every section inspected |
| 5 | Error Prevention | 4 | Honeypot + timing anti-spam, party-size clamping, inline errors that clear themselves and move focus to the actual problem field |
| 6 | Recognition Rather Than Recall | 3 | Returning guest sees their prior RSVP restated in plain language; nav uses labeled icons |
| 7 | Flexibility and Efficiency | n/a | Single-visit marketing/Persuade surface — a one-time guest has no use for shortcuts |
| 8 | Aesthetic and Minimalist Design | 3 | Hero/Letter/RSVP compositions are restrained; the tiled "Invimbo" watermark is visually heavy — confirmed by the detector logging 10 distinct occlusion events against it in a single RSVP-section viewport |
| 9 | Error Recovery | 3 | RSVP errors are plain-language, non-destructive, and field-level; the map's broken state offers no recovery path (no phone/address text fallback) |
| 10 | Help and Documentation | n/a | Marketing/experience surface — contextual help would be noise here |

**Total: 25/32 (8 heuristics scored, 2 n/a) → 78% → Good**, same percentage band as the prior run (28/36 ≈ 78%) despite a different heuristic mix — see Trend note below for why the raw numbers moved while the band held.

## Design Specificity Verdict

**LLM assessment (Assessment A)**: Mostly earned, with one conspicuous generic patch. The system is not a reskinned template — 20+ structurally distinct Hero variants, and a real `decorMotifs.ts` system ties RSVP/Letter/Gift to the same illustrated corner-flourish pair per theme category (verified live: the RSVP fix from this session's work is real and rhymes visually with the Letter section above it, not bolted on). Where it breaks: on the one live seeded event available, the "Welcome Letter" — the one section whose entire job is to carry the couple's own voice — contains only an unattributed generic quote, no names, no greeting. And the Location section renders dashboard-editor copy verbatim to guests at the exact moment they're trying to do something concrete (find the venue).

**Deterministic scan (Assessment B)**: `impeccable detect --json` over the target files and `components/sections` came back clean (exit 0, zero findings) — no structural anti-patterns in the source. The live browser overlay told a different story: an initial scan found 3 anti-patterns (1 borderline tight-leading, 1 overused-font note, 1 text-occlusion), and a full-page rescan after scrolling found 12 — 10 of them text-occlusion events, all of the same shape: the tiled watermark background sits behind RSVP form controls (inputs, labels, toggle buttons), which the detector reports as the controls "covering" watermark tiles.

**Likely false positives**: The 10 text-occlusion findings are, read literally, not real defects — an opaque form input needing to sit above a decorative background texture to stay legible is correct, expected behavior, not overlapping readable text competing for attention. But read as a signal rather than a literal defect, they're useful: 10 distinct collision events in one form's viewport is hard evidence for how dense the watermark tiling actually is, which directly corroborates Assessment A's independent P2 finding below. The overused-font flag (Inter, 86-87% of text) is also likely benign by design — this is body/UI copy; the theme's distinctive serif/script typography is reserved for the couple's names and headings, which is the right split, not a flaw. The single tight-leading flag sits right at the detector's own threshold (1.30x vs. "needs ≥1.3") and isn't worth treating as a real finding.

**Agreement between assessments**: Both independently flagged the exact same artifact — the map section's "Add an address to preview the map" placeholder — Assessment A as a UX/priority issue (host-editor voice shown to guests, no recovery path), Assessment B as a plain factual observation while screenshotting the Location section. That's strong corroboration it's real, not a one-reviewer quirk.

**Scope caveat from Assessment B**: the live test event used for inspection (`mia-and-leo`) only has 4 sections enabled (Hero, Letter, Map, RSVP) — no Countdown/Schedule/Gallery/Gift were present in the DOM, narrower than briefed. This doesn't affect the findings above, but means Countdown/Schedule/Gallery/Gift weren't re-verified this run (they weren't flagged as problems in the prior 28/36 run either, so no regression is assumed, just unconfirmed this pass). Assessment B also could not get the browser to a true 1440px desktop viewport (stuck at ~657px regardless of resize calls) — all its screenshots are effectively narrow/mobile-width, so desktop-specific layout wasn't independently re-screenshotted this run.

## Overall Impression

The two fixes from this session's work that this critique set out to verify are both real and land well: the RSVP corner-flourish decor is genuinely tied into the same illustrated system as Letter/Gift rather than a generic fallback, and the motion/polish fixes (RSVP's "taking longer" reassurance, prior-response recall, focus-on-error) show up as concrete heuristic-5/9 strengths neither assessment had to be told about — they just held up under fresh, independent inspection. The score held flat in percentage terms (78% both runs) rather than climbing, because this pass surfaced two issues that weren't centered in the prior one: a guest-facing section (Map) that leaks internal/editor-voice placeholder copy with no recovery path, and the one section built to carry the couple's personal voice (Welcome Letter) shipping as generic stock sentiment on the one real test event inspected. The single biggest opportunity is the map placeholder — it's the first moment on an otherwise warm, specific site that visibly looks broken to a guest, at the exact moment they're trying to plan real travel.

## What's Working

1. **The one-tap RSVP path for personalized guests** (`isPersonalized` branch in `SimpleForm.tsx`) collapses the hardest, highest-abandonment step of any wedding site into two large buttons with a "more details" escape hatch — built explicitly, per the code's own comment, for an older relative on a phone. This is product design, not just polish.
2. **The corner-flourish decor system is a real design system.** `CORNER_PAIR_DECOR` ties RSVP, Letter, and Gift to the same illustrated asset pair per theme category with per-section tuned size/inward values — verified live, RSVP's wildflower pairing visually rhymes with Letter rather than feeling bolted on. This is the direct payoff of this session's RSVP decor fix.
3. **Error handling is unusually considerate for a marketing-style page.** RSVP's missing-field error moves focus to the actual empty field, scrolls to the actual unanswered toggle, and clears itself the instant the guest starts fixing it — heuristic-9-grade recovery in a surface most teams would treat as "it's just a form."

## Priority Issues

**[P1] Guest-facing map section leaks host-editor copy and offers no recovery**
- **What**: When a venue has a name but no resolvable address, the Location section renders the literal string "Add an address to preview the map" to guests — confirmed live (an empty bordered box under "The Grand Hall"), and independently confirmed as a factual screenshot observation by the second assessment.
- **Why it matters**: "Add" is an instruction to whoever edits the site, not to a guest. A guest reading this can't act on it and gets no fallback — no plain-text address, no "contact the couple" link. It's also the first moment the site visibly looks broken rather than unfinished-by-design, right when a guest is trying to plan real travel. Confirmed as a reachable, not contrived, state: any host who saves a venue name before finishing the address ships this to every guest.
- **Fix**: Render the address as plain text whenever it's present, independent of whether the map embed can render (the data already exists in props — it's just gated behind the embed `src`). Replace the placeholder with guest-appropriate copy ("Address coming soon") only when the address is genuinely empty, not instruction-voiced copy.
- **Suggested command**: `/impeccable clarify`

**[P1] "Welcome Letter" carries no couple-specific content on the one live example inspected**
- **What**: The Letter section on the test event is a single unattributed literary quote — no heading, no greeting, no names, no personal note.
- **Why it matters**: This is the one section structurally reserved for the couple's own voice. As shipped, a guest scrolling from the Hero (which does say "Mia & Leo") into the Letter hits a complete emotional drop into generic stock sentiment, right where momentum should build.
- **Fix**: Either seed the default content as an obviously-a-draft placeholder with a pre-publish nudge for the host to personalize it, or extend the existing emptiness-gating pattern (already used for Timeline/Map/FAQ) to flag "quote-only, no personal body" specifically.
- **Suggested command**: `/impeccable onboard` for the host-side nudge, `/impeccable clarify` for the content treatment

**[P2] Watermark overlay is visually aggressive for the context**
- **What**: The tiled "Invimbo" watermark (shown on unpublished/free-plan sites) is dense enough to generate 10 distinct text-occlusion events against a single RSVP form's visible area in the detector's live scan — legible enough to compete with the couple's own names in the Hero and to run directly behind form fields a guest is actively filling in.
- **Why it matters**: This page's entire job is to feel like an intimate, bespoke object. A watermark this dense reads as "you're on the free tier" louder than "you're invited to a wedding," undercutting the aesthetic/minimalist heuristic and the product's own stated goal.
- **Fix**: Keep the upgrade nudge, but reduce density/opacity so it reads as a watermark rather than a repeating pattern competing for attention — particularly in the area directly behind active form inputs.
- **Suggested command**: `/impeccable quieter`

**[P3] Envelope-reveal first-impression moment is unverifiable/unrepeatable**
- **What**: The envelope-open animation is strictly once-per-browser via localStorage, with no discoverable way to replay it.
- **Why it matters**: Low severity, deliberate trade-off — but it means the single biggest "wow" first-paint moment on the whole site is one-time-only per device, with no replay affordance (e.g., for a guest who wants to show a partner).
- **Fix**: Consider a small, discoverable replay affordance near the Hero.
- **Suggested command**: `/impeccable delight`

## Persona Red Flags

**Jordan (First-Timer guest)**: Hits the Location section and sees "Add an address to preview the map" with no framing — the most literal reading is "the site is broken" or "I'm supposed to add something," neither of which is true or actionable for a guest. The Letter section's unattributed quote has no "a note from Mia & Leo" framing, so Jordan can't tell if it's the couple's own words or decorative filler — exactly the ambiguity that makes a first-timer hesitate to trust the page.

**Riley (Stress-Tester)**: The venue-name-without-address state is a real, reachable production state, not a contrived edge case — any host who saves a name before finishing the address ships this to every guest; Riley would flag this as "works in the editor, breaks silently in production," a classic Riley pattern. Conversely, Riley would specifically approve of the honeypot + submit-timing anti-spam combo — it defeats bots without adding friction (no CAPTCHA, no extra confirmation) for real guests.

**Casey (Mobile)**: The one-tap personalized RSVP (two large buttons, generous touch targets) is exactly right for Casey — big targets, zero typing, one decision. Responsive breakpoint behavior at true desktop width wasn't independently re-confirmed this run (tooling limitation, see scope caveat above), so flagging as unverified-but-previously-confirmed-good rather than re-tested clean.

## Minor Observations

- The RSVP card's own default heading seeds as literally "RSVP" with no warmth ("Will you join us for Mia & Leo's wedding?") — a missed chance to personalize a section every guest interacts with.
- The RSVP success-state is a single line of text with no next step (no "add to calendar," no visible "edit your response" link) even though that edit capability clearly exists elsewhere in the component — a slightly flat landing for what should be the flow's reassuring final beat.
- The attending-toggle buttons have `aria-pressed` wiring but no `role="group"`/`radiogroup` tying "Joyfully accepts"/"Regretfully declines" together as one question for screen reader users.

## Questions to Consider

1. If the Welcome Letter is meant to be the emotional core of the page, why does the product let a host publish with it containing only a generic quote, when comparable emptiness-gating already exists for Timeline/Map/FAQ?
2. The map's broken-address placeholder is clearly a deliberately-written, handled state in the code — was that copy ever written from the guest's point of view, or only ever seen from the dashboard/editor context during development?
3. Given the one-tap RSVP already treats "guest on a phone, low patience, high stakes" as the default persona — should the watermark and the map's broken state be held to that same bar, rather than treated as acceptable because they're plan-gating or edge concerns?
