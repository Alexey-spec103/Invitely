---
target: app/e/[slug]/page.tsx
total_score: 26
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\AP309\\dev\\invitely\\app\\e\\[slug]\\page.tsx"
target_fingerprint: "sha256:d706ca22aeea308fbeb19d96ad3ed7cd61988119c104791068ea3f86e6cd7592"
target_path: "C:\\Users\\AP309\\dev\\invitely\\app\\e\\[slug]\\page.tsx"
timestamp: 2026-10-22T08-37-18Z
slug: app-e-slug-page-tsx
---
Method: dual-agent (Assessment A: isolated sub-agent · Assessment B: isolated sub-agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good pending/success/error states; the draft-preview banner's promise and the actual RSVP rejection contradicted each other (now fixed this run) |
| 2 | Match Between System and Real World | 4 | Warm, occasion-appropriate copy; decor matches the chosen style category |
| 3 | User Control and Freedom | 3 | Prior RSVP is editable on reload; no inline "edit" affordance in the seconds right after a fresh submit |
| 4 | Consistency and Standards | 4 | Shared icon/label system, shared corner-flourish decor system across sections, standard form patterns |
| 5 | Error Prevention | 3 | Honeypot + timing + rate-limit anti-spam, server-side party-size clamp; docked for a layout reflow when the attendance toggle inserts a new field above Submit |
| 6 | Recognition Rather Than Recall | 4 | Server + localStorage RSVP recall, one-tap accept/decline for personalized links, pre-filled name |
| 7 | Flexibility and Efficiency | n/a | One-time-use public invitation page, not a repeat-use tool |
| 8 | Aesthetic and Minimalist Design | 3 | Clean, uncluttered, generous whitespace; the diagonal watermark (now quieter) still tiles every empty background |
| 9 | Error Recovery | 2 | Inline validation is excellent (focus-shift, scroll-to-field, clear messaging), but the draft-preview RSVP contradiction undercut trust at the highest-stakes moment on the page (fixed this run) |
| 10 | Help and Documentation | n/a | Single-purpose consumer page; no documentation surface expected |

**Total: 26/32 (8 heuristics scored, 2 n/a) → 81% → Good**, the highest of this session's three critique runs (72% → 78% → 81%).

## Design Specificity Verdict

**LLM assessment**: Partially specific, not generic. The Hero genuinely reflects the couple — real names in a flowing script, a real date, decor matching the chosen style category, not a stock placeholder. Nav, the envelope monogram, and RSVP copy ("Joyfully accepts" / "Regretfully declines") read as warm and wedding-specific. For a brand-new, untouched trial event, though, only 3 of 14 possible sections ship (Hero, Letter, RSVP), and the Welcome Letter contains just an unattributed literary quote with no personal words — a deliberate writing-prompt design (confirmed in source), but nothing on the actual public page signals to a guest that this is unfinished.

**Deterministic scan**: `impeccable detect --json` over the target and `components/sections` came back clean across three separate invocations (full target, `components/sections` alone, `app/e` alone) — exit 0, zero findings each time, confirmed not a path/glob artifact. The live browser detector found exactly one anti-pattern across a full scroll-through of a freshly created test event: `overused-font` (Inter, 78% of text) — consistent with the prior run's read on this (body/UI copy in a readable sans while the theme's display font carries the couple's names and headings is the right split, not a flaw). No text-occlusion, tight-leading, or other findings fired this time.

**Agreement between assessments**: Both independently created and exercised a fresh live test event (the prior one was lost to a local dev-environment reset) and converged on a clean, defect-free render — no broken images, no overlapping text, no clipped or misaligned elements in either pass.

**Scope caveat**: viewport resize to a true mobile width did not take effect in this environment for either assessment (consistent with every other browser-automation pass this session) — mobile-specific layout was not independently re-verified this run.

## Overall Impression

This is the strongest of the three runs today, and the first to score in the 80s. The session's defect-fixing work held up under fresh, independent inspection — the map placeholder leak and watermark density flagged in the previous run are both gone, and a full WCAG pass, a performance pass, and a security-hardening pass all landed without regressing anything either assessment could find. What pulled the score down from "Excellent" wasn't appearance — it was a genuine trust-breaking contradiction at the single highest-stakes moment a first-time host experiences: the draft-preview banner promised a harmless test submission, and the real RSVP flow then rejected it with a different message. That's fixed as of this report (reworded in all 8 locales to match the real, confirmed behavior). The remaining open items are narrower: a reproducible-but-undiagnosed quirk in the once-per-browser envelope reveal, and a minor layout reflow when the RSVP form's attendance toggle inserts a new field.

## What's Working

1. **RSVP recall architecture.** Server-side lookup for personalized invite links plus a localStorage fallback for self-service guests means a returning guest never sees a blank form twice, and a personalized-link guest gets a one-tap accept/decline instead of a multi-field form — removing real friction from the highest-stakes interaction on the page.
2. **Accessibility craftsmanship, not checkbox-ticking.** Verified directly in the accessibility tree: the accept/decline toggle is a real `role="group"` with `aria-labelledby`, the honeypot field is correctly excluded from the AT tree, the name field wires `aria-invalid`/`aria-describedby` to its real error, and success/error states use `role="status"`/`role="alert"` correctly — direct payoff of this session's accessibility pass.
3. **Envelope-reveal as a genuine "peak" design moment.** Monogram seal with couple initials, spring-eased flap animation, dialog semantics, and focus-on-open — when it fires, it's well-considered ceremony design appropriate to a wedding product (see the open question about whether it reliably fires for real guests, below).

## Priority Issues

**[P1 — fixed this run] Preview-banner promise contradicted the actual RSVP rejection**
- **What**: The draft-site banner told a previewing host that RSVP submissions "are just a test and won't be saved" (implying a silent no-op). The real RPC hard-rejects with `EVENT_NOT_PUBLISHED`, surfaced as a different, unrelated-reading error. Confirmed live by submitting a complete, valid RSVP on a draft site.
- **Why it matters**: This is exactly the moment a first-time host tests their own form to build confidence before sending real invitations — and got an error that reads as a broken product immediately after being told nothing bad would happen.
- **Fix applied**: Reworded the banner in all 8 locales to accurately describe the real behavior ("RSVPs can't be submitted here until you publish"), matching the existing `notPublishedError` copy's contract.
- **Command**: `clarify` (applied)

**[P2] Envelope-reveal's once-per-browser flag appeared pre-consumed before a genuine first visit**
- **What**: On a brand-new event, the public link's envelope-reveal didn't fire on the first-ever navigation to it in one assessment's testing — `localStorage` already held the "opened" flag for that event's ID, and clearing the key restored correct behavior. The exact write path that pre-consumed it wasn't conclusively traced.
- **Why it matters**: If this reflects a real path in production, the one genuinely delightful "peak" moment in the guest experience may rarely reach its actual intended audience.
- **Fix**: Needs an engineering trace of what writes `invitely:envelopeOpened:<eventId>` before a guest's first visit, before any fix is attempted — not diagnosed well enough yet for a safe change.
- **Suggested command**: `audit`, then `harden` once traced

**[P3] RSVP's Submit button relocates immediately after choosing "Joyfully accepts"**
- **What**: Selecting "attending" inserts a new "Number of guests" field above Submit, shifting it down ~35-50px with no scroll compensation.
- **Why it matters**: On mobile especially, this is the exact moment a guest's thumb is positioned to tap Submit — a layout shift right there risks mis-taps.
- **Fix**: Reserve space for the conditional field before it's needed, or animate the height transition so the shift is visible rather than instant. Not applied this run — a motion/layout change on an already heavily-tested form, lower urgency (P3) than the fixes above.
- **Suggested command**: `polish` or `animate`

**[P3] Welcome Letter can ship to real guests with zero personalization**
- **What**: An unedited trial event's Letter section shows only a generic literary quote — no title, no host-written text. Nothing stops a host from sharing the link before writing anything.
- **Why it matters**: The Letter is the one section meant to carry a couple's own voice; its absence is invisible to a guest, who may not realize the quote isn't the hosts' own words.
- **Fix**: A dashboard-only nudge for this already shipped earlier this session ("Add your words" badge); this finding is about the guest-facing side, which remains unaddressed by design since gating link-sharing on content completeness is a bigger product decision.
- **Suggested command**: `onboard` (host-side completion flow)

## Persona Red Flags

**Jordan (First-Timer, anxious host)**: Will almost certainly test her own RSVP form from the preview before mass-sharing — the single most predictable behavior for this persona — which is exactly the P1 contradiction just fixed. She also has no visible signal that her Letter section is still a stock quote and may share the link believing it's personalized.

**Riley (Stress-Tester)**: Will catch the Submit-button relocation (P3) within seconds as a reproducible layout quirk. Will also notice that toggling localStorage trivially re-triggers the "once per browser" envelope promise, and will ask the same question Assessment A had to answer by hand: does this reliably fire for real guests, or does something upstream quietly consume it first (P2)?

**Casey (Mobile)**: The Submit-relocation issue (P3) is strictly worse on a touchscreen with no hover-recovery. True narrow-viewport rendering could not be independently verified this run (environment limitation, consistent across every browser-automation pass today) — flagged as an untested gap rather than confirmed either way.

## Minor Observations

- Internal localStorage keys (`invitely:envelopeOpened:...`, `invitely:rsvp:...`) still use the old "invitely" brand prefix despite the product's rename to Invimbo — purely internal, not user-visible, low priority.
- The watermark, while confirmed visually and mechanically quieter than before (0 text-occlusion detector findings this run vs. 10 previously), still tiles diagonally across every empty background on the free tier — acceptable as an intentional upsell signal, worth keeping an eye on as "quieter" rather than "gone."
- A small circular scroll-down chevron at the bottom of each section is a nice discoverability affordance for continuing to read.

## Questions to Consider

1. Given that essentially every host will test their own RSVP form before sending invitations, and real guests may share a device with the host, is a reworded banner enough, or does the product want draft-mode RSVPs to actually succeed as a true no-op test (a bigger behavior change, not attempted this run)?
2. The envelope-reveal is designed as a once-per-guest "peak" moment, but it didn't fire reliably in testing — is it worth instrumenting reveal-completion rate against guest page-views to see how often real weddings' real guests ever see it?
3. A brand-new trial ships 3 of 14 possible sections, with the one narrative section defaulting to a stock quote with zero host words — is a dashboard-only nudge enough, or does a host need a signal reachable from the shareable link itself before they're confident enough to send it?
