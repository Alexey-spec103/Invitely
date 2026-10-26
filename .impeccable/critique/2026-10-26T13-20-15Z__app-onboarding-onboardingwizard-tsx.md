---
target: onboarding wizard (clarity/cognitive-load pass)
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
target_identity: "file:C:\\Users\\AP309\\dev\\invitely\\app\\onboarding\\OnboardingWizard.tsx"
target_fingerprint: "sha256:df2a975f190db296318d76c1b20703212c1cbcc497cc7655c8e80ab11cf585fd"
target_path: "C:\\Users\\AP309\\dev\\invitely\\app\\onboarding\\OnboardingWizard.tsx"
timestamp: 2026-10-26T13-20-15Z
slug: app-onboarding-onboardingwizard-tsx
---
Method: dual-agent (A: general-purpose onboarding design review · B: general-purpose onboarding detector evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | A field's error text can say "Enter a name" while the field holds a valid, correctly-typed value — confirmed, reproducible |
| 2 | Match System / Real World | 3 | Plain human copy throughout; dinged for step-3 explainer describing a step order already completed |
| 3 | User Control and Freedom | 2 | No visible exit/home affordance in the wizard chrome besides browser-back; draft autosave partially compensates |
| 4 | Consistency and Standards | 3 | Consistent CTA styling and step pattern; dinged for the explainer-sequencing mismatch and abrupt handoff |
| 5 | Error Prevention | 3 | Zod-backed validation, double-submit guarded, photo correctly optional |
| 6 | Recognition Rather Than Recall | 4 | Everything is click-to-select; live preview means nothing has to be imagined |
| 7 | Flexibility and Efficiency | 3 | Search + category filters on the 124-style gallery, "Popular" default, localStorage draft resume |
| 8 | Aesthetic and Minimalist Design | 3 | Steps 1-2 lean; step 3 stacks explainer + search + sidebar + grid right before commitment |
| 9 | Error Recovery | 2 | Error wording is fine in principle, but the stale-error bug directly breaks this heuristic |
| 10 | Help and Documentation | 3 | Dismissible "how it works" card is a reasonable embedded-help pattern, just mistimed |
| **Total** | | **28/40** | **Good (70%)** |

## Design Specificity Verdict

**LLM assessment**: Not a generic, unconsidered flow — source comments show a team that has genuinely audited this wizard multiple times (step-count reduction 4→3, mobile preview-ordering fix, double-submit race fix). The clarity problems that remain are specific and traceable, not systemic indifference. The irony: the team already fixed this exact class of bug (stale validation error) for the date field, with a comment explicitly asserting the two adjacent name fields "clear fine" — they don't. A verification gap, not a design-intent gap.

**Deterministic scan**: `impeccable detect` on OnboardingWizard.tsx returned clean (exit 0, zero findings). Live DOM evidence instead: progress indicator ("STEP X OF 3") present and correct at every step; Step 1's 12 event-type choices and Step 2's name/date fields are properly labeled and keyboard-focusable with visible, non-suppressed focus rings (confirmed via real Tab presses, not JS .focus()). Empty-field submit produces clear inline errors, no silent failure.

**New accessibility gap found**: the optional photo-upload `<input type="file">` has no `id`, no `aria-label`, no `aria-labelledby`, and `input.labels.length === 0` — zero accessible name. A screen reader announces this control with nothing to identify it.

**Confirmed objectively**: validation error text does not live-clear as the user types a valid value — it clears only on the next form re-submission. This is the mechanism behind the P0 below, confirmed independently by both assessments.

## Overall Impression

The flow's first two steps earn trust well — low-friction identity question, then a live preview that turns typed names into an actual styled wedding mockup in real time. That trust takes two direct hits: a false validation error on the single most personal input in the flow (the couple's own names), and a crowded, upsell-heavy handoff screen right at the moment that should feel like an accomplishment. Both are fixable without touching the flow's structure.

## What's Working

1. **Live-synced preview on the names/date step** — typing updates an actual styled hero mockup in real time, closing the biggest ambiguity in any site builder ("what will this look like") immediately rather than after a save/publish step.
2. **Bounded draft autosave** — persists to localStorage on every change, restores on return, expires after 7 days rather than resurfacing an abandoned draft indefinitely.
3. **Defaulting the 124-style gallery to a curated "Popular 14"** — turns a potentially paralyzing catalog into a manageable first screen while keeping full search/filter access one click away.

## Priority Issues

**[P0] Stale "Enter a name" validation error persists after a valid name is typed and the field is blurred**
- **Why it matters**: This is the step asking for the user's own name and their partner's — the most personal input in the entire flow. A "you did this wrong" message under correctly-typed names, on a wedding site builder, is exactly the moment that erodes confidence right as someone is committing something emotionally loaded. Reproduced directly and confirmed objectively (error text doesn't live-clear, only clears on re-submit) by both assessments.
- **Fix**: The same fix already applied to `eventDate` (an explicit `trigger()` call in its `onChange` handler) was never applied to `name1`/`name2`'s plain `{...register(...)}` calls. Apply the identical fix to both name fields.
- **Suggested command**: /impeccable harden

**[P1] Handoff screen crowds the first post-completion view with 6+ competing asks, including two separate paywall prompts**
- **Why it matters**: The one payoff moment the whole wizard builds toward ("here's your finished site") is buried under an incomplete-data warning, two "Remove the badge – €19" prompts (top bar and sticky bottom bar), and a coachmark tooltip, all rendered simultaneously before the user has had one clean look at what they made.
- **Fix**: Show the finished hero uncluttered first; defer the badge-removal CTA at least one interaction past first paint; don't fire the coachmark and the incomplete-data banner in the same view.
- **Suggested command**: /impeccable onboard

**[P2] Step 3's "how it works" explainer describes a step order that contradicts the one just lived**
- **Why it matters**: The card reads "Pick a style → Add your details → Share your site," but the user already did "add your details" in step 2, before reaching this card — creates a small "wait, did that save?" doubt right before the final choice.
- **Fix**: Move the explainer to step 1 (true pre-flow orientation), or rewrite the step-3 copy to acknowledge what's already done.
- **Suggested command**: /impeccable clarify

**[P2] Photo-upload file input has no accessible name**
- **Why it matters**: No `id`/`aria-label`/`aria-labelledby`, `labels.length === 0` — a screen reader announces this control with nothing to identify it.
- **Fix**: Associate the hidden file input with its visible "Add a photo (optional)" label/drop-zone via `aria-labelledby` or an explicit `<label>`.
- **Suggested command**: /impeccable harden

**[P3] Step progress indicator disappears once the user scrolls, with no persistent replacement**
- **Why it matters**: "STEP X OF 3" is plain text at the top of a scrolling card; gone from view once the user scrolls the 12-item event-type grid or 124-item style gallery. The sticky footer shows only Back/Next, no step context — on mobile there's no way to tell how much is left.
- **Fix**: Repeat the step counter (or a lightweight dot/bar) inside the sticky footer alongside Back/Next.
- **Suggested command**: /impeccable layout

## Persona Red Flags

**Jordan (First-Timer)**: Scans the 12 event types fine, picks Wedding. On step 2, types both names and immediately hits the P0 — both fields show "Enter a name" in red under text just typed, with no way to know this is cosmetic. Reaching step 3, reads "Add your details" presented as a future step already completed. After "Create my site," lands on a dashboard showing an incomplete-site warning, a form asking for venue/city/address never mentioned before, and a badge-removal prompt — before seeing the actual finished site rendered cleanly.

**Casey (Mobile)**: Benefits from the mobile-specific preview-ordering fix already in place (preview appears above the name/date fields on narrow viewports) and from the draft autosave if interrupted. But she's also most likely to type fast, hit the stale-error flash, and assume the form is broken without the patience to investigate. At handoff, the crowded dashboard compresses into a single scrolling column on mobile — worst-case layout for the persona least willing to scroll through six competing prompts to find her actual site.

## Minor Observations

- Step 1's Back button is `disabled` + `opacity-0` rather than removed/hidden — leaves an inert clickable-looking blank space rather than a cleaner first-step layout.
- The event-type grid's "more options below" cue is a static bottom fade, not scroll-position-aware — easy to miss as intentional rather than a rendering artifact.
- Before any name is typed, the step-2 preview renders literal placeholder strings ("First partner's name" / "Second partner's name") stacked across the decorative wreath — could register as a glitch on first glance.
- Wedding is the pre-selected default event type — reasonable if dominant, worth confirming the assumption holds across all 12 types.

## Questions to Consider

- The codebase already fixed this exact stale-validation-error bug once, for the date field, with a comment explicitly (and wrongly) asserting the name fields don't share it — if a documented fix for one field doesn't get checked against its siblings, what else shares the same blind spot?
- Is the handoff screen's badge-removal prompt deliberately shown on first visit to catch users at peak excitement, or is it unmodified default dashboard chrome nobody has built a first-visit variant for yet?
- The wizard's actual order is type → details → style, but its own explainer teaches style → details → share — which is the real intended mental model, and should the wizard or the explainer change to match the other?
