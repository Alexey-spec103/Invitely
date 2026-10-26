---
target: dashboard Site tab constructor shell (clarity/cognitive-load pass)
total_score: 24
max_score: 36
na_heuristics: 9
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\AP309\\dev\\invitely\\app\\dashboard\\[eventId]\\site\\page.tsx"
target_fingerprint: "sha256:e324c6150dee882a3216f9b667fb261d28f8cf34b86bd5aaefe0541915269706"
target_path: "C:\\Users\\AP309\\dev\\invitely\\app\\dashboard\\[eventId]\\site\\page.tsx"
timestamp: 2026-10-26T13-20-15Z
slug: app-dashboard-eventid-site-page-tsx
---
Method: dual-agent (A: general-purpose Site constructor design review · B: general-purpose Site constructor detector evidence)

Scope note: the component-level polish of this page (contrast, individual widget bugs, undo/retry affordances) already went through a heavy critique marathon earlier this project (32/40, zero open P0/P1). This pass deliberately scoped to the editor SHELL's information architecture and cognitive load for a brand-new host, not re-litigating that prior work.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Autosave explained once via coachmark; no persistent save/sync indicator after the tour is dismissed |
| 2 | Match System / Real World | 3 | Wedding-domain vocabulary throughout; docked for the unexplained "Free canvas" toggle beside the "Wedding" pill |
| 3 | User Control and Freedom | 3 | Undo/redo present at shell level; section-level on/off toggles only discoverable by scrolling into each section |
| 4 | Consistency and Standards | 2 | Two editing paradigms coexist (labeled sidebar forms vs. click-in-preview) with no persistent UI marking the boundary — taught once via a skippable tooltip |
| 5 | Error Prevention | 3 | "Fill in your wedding details" nudge card is a good structural guardrail against publishing incomplete |
| 6 | Recognition Rather Than Recall | 2 | No outline/table of contents of content sections — only way to know what's on the site is scrolling the live preview from the top every time |
| 7 | Flexibility and Efficiency | 3 | Inline editing is fast once you're at the right spot; no jump-to-section control for repeat/targeted edits |
| 8 | Aesthetic and Minimalist Design | 2 | Top bar carries 5+ same-weight orange CTAs with no hierarchy, plus a sticky bottom bar duplicating the badge-removal upsell |
| 9 | Error Recovery | n/a | Out of scope — component-level, already audited in the prior marathon |
| 10 | Help and Documentation | 3 | 4-step first-visit coachmark is well-built progressive disclosure, self-aware enough to address the dual-paradigm risk directly |
| **Total** | | **24/36** | **Acceptable (67%)** |

## Design Specificity Verdict

**LLM assessment**: Mixed. The content layer (Wedding data fields, "Letter," QR invitation code, "Suggest a quote" AI helper) feels genuinely purpose-built. But the shell — a top bar of undifferentiated orange buttons, a sticky upsell bar, an unlabeled "Free canvas" mode switch, an icon-only inline toolbar — reads like generic SaaS admin chrome wrapped around a wedding-specific core. A first-timer's very first impression (the chrome) is less purpose-built than the second impression (the actual preview content).

**Deterministic scan**: `impeccable detect` against the page file returned one finding — `border-l-4` (thick colored side border, flagged as a recognizable AI-generated-UI tell) at line 565; worth a human check since the rule doesn't inspect visual context (could be a legitimate active-tab indicator). No other static findings.

**Live DOM evidence — significant, corroborating findings**:
- Above-the-fold decision-point count: **~17 distinct interactive controls** visible without scrolling (top bar 7, left nav 4, main panel 5, sticky bottom banner 1) — well past the skill's "8+ is overloaded" threshold, and none of them are the module toggles a visitor would expect to see first.
- Heading hierarchy in the editor region: **two `<h1>`s** on one page ("Site" and the couple's name) plus **three empty `<h2>` elements** with no text content.
- **Duplicate navigation markup**: a query for the 4 nav-link hrefs (Style/Site/Paper/Guests) returned **10 matching `<a>` elements**, not 4 — a second (likely mobile-stepper) nav structure exists in the DOM alongside the visible desktop sidebar.
- **Keyboard tab order is scrambled**: in 4 real Tab presses from a neutral start, focus jumped from a QR-download link, to an off-screen "Dismiss" button, to a non-interactive-looking info card, to a module toggle far below the fold — never once landing on the logo, nav links, or primary top-bar actions. Consistent with the duplicate-nav finding above (extra DOM elements inflating the tab-order pool).
- DOM size: 1414-1428 elements (under the 1500 red-flag line, but before the below-the-fold Modules panel is counted — the full-page total is likely higher).

## Overall Impression

The individual pieces here are good — confirmed by the prior 32/40 marathon. The shell around them has not been simplified to match: it front-loads monetization, utility settings, and an unexplained mode switch before the user reaches the thing they actually came to do, and the one way to discover what's actually on the site (scrolling) has no structural aid. The keyboard-navigation evidence raises a real question about whether the site's actual content is reachable without a mouse at all.

## What's Working

1. **The first-visit coachmark tour** is well-built progressive disclosure (skippable, dotted progress, one tooltip per concept) — and one step directly addresses the exact "is this two editors bolted together?" risk this audit was scoped to probe, meaning the team already identified and is actively mitigating it.
2. **The "Fill in your wedding details" nudge + auto-expanded, 50%-complete form** gives a first-timer an unambiguous, single next action.
3. **Section-level affordances** (visibility toggle, palette/theme icon, contextual "Suggest a quote" AI helper) are genuinely well-designed in isolation — the problem is purely that they're undiscoverable until scrolled to.

## Priority Issues

**[P0] No outline/jump-nav for content sections, and no confirmed keyboard path to edit ~90% of the site's content**
- **Why it matters**: Hero, Letter, RSVP, Timeline, Dress Code, Gift, Guestbook — essentially all actual wedding content — is editable *only* via direct click-in-place inside the live preview, confirmed by testing (clicking text opens a small floating icon-only toolbar anchored to the click point). The sidebar's 6 labeled form cards — the one clearly keyboard/screen-reader-friendly surface — cover only utility/meta settings, not content. Combined with the live-measured scrambled tab order (focus jumping from a QR link straight to a module toggle below the fold, skipping the entire top nav), this is not a confirmed-working alternate path — it's an open question the team should resolve directly, not a polish item.
- **Fix**: Add a persistent, lightweight section list (sticky mini-TOC or collapsible rail) generated from the actual sections present, serving both as navigation and as a confirmed-reachable keyboard entry point into each section's edit mode. Separately, audit and fix the duplicate nav markup (10 elements for 4 links) that's inflating the tab-order pool.
- **Suggested command**: /impeccable layout, then /impeccable audit (accessibility focus)

**[P1] Duplicate, full-weight monetization CTA ("Remove the badge – €19") in both the top bar and a sticky bottom bar**
- **Why it matters**: Two identical upsell asks before the user has entered any content reads as pressure, not help, and directly undercuts the confidence the coachmark/nudge-card combination is trying to build on this same screen.
- **Fix**: Consolidate to one location; demote visual weight so it doesn't compete with Publish.
- **Suggested command**: /impeccable distill

**[P1] Dual editing paradigm (labeled sidebar forms vs. click-anywhere-in-preview) is explained only by a one-time, skippable tooltip**
- **Why it matters**: Once the tour is dismissed, nothing in the persistent UI marks "these 6 cards are site-wide settings, everything else is content you edit by clicking it" — users who skip the tour or return later have no structural cue.
- **Fix**: Add a small persistent section header/divider (e.g. "Site settings") above the 6 cards so the boundary stays visible, not just taught once.
- **Suggested command**: /impeccable clarify

**[P2] Top bar carries 5+ same-weight orange CTAs with no primary/secondary distinction**
- **Why it matters**: Contributes directly to the "wall of options" feeling before any real task begins (~17 controls above the fold); Publish — the actual milestone action — doesn't read as more important than Copy-link or Remove-badge.
- **Fix**: Establish one clear primary action style, demote the rest to outline/ghost/neutral.
- **Suggested command**: /impeccable shape

**[P3] "Free canvas" toggle next to the default "Wedding" pill is an unlabeled mode switch with no tooltip or coachmark coverage**
- **Why it matters**: A first-timer has no idea what switching modes does or whether it's reversible/destructive to their current content.
- **Fix**: Add a short inline explainer the moment it's hovered/clicked.
- **Suggested command**: /impeccable onboard

## Persona Red Flags

**Alex (Power User)**: No jump-to-section control means every targeted edit (e.g., "just fix the RSVP deadline") requires scrolling the full live preview from the top — gets worse, not better, with repeated use. No visible keyboard-shortcut affordances beyond generic undo/redo icons. The two redundant "Remove the badge" CTAs are pure visual noise filtered past on every visit, not just the first.

**Sam (Accessibility-Dependent)**: The sharpest finding of this pass. With the sidebar reduced to 6 utility settings, essentially all actual wedding content is editable only via direct click-in-place in the live preview. Live-measured evidence (scrambled tab order, duplicate 10-element nav markup for 4 visible links) does not confirm an independent, reliable keyboard path into that editing mode. No landmark/region cues were evident between the fixed left nav, settings-card column, and preview column — for a screen reader this risks reading as one undifferentiated stream. This is an IA decision, not a component bug, and should be treated as a structural gap.

## Minor Observations

- The invitation-link panel (Copy/Open/QR/Download) is prominent at the very top, before Publish — a first-timer could share a link to a site that, per the panel's own caption, guests can't see until published.
- The sticky bottom bar and the bottom-left chat bubble sit close together at narrower viewport widths, risking tap-target crowding.
- The "Wedding data 50% complete" badge is a nice, lightweight completion/motivation cue — a good model to extend to other cards.
- The detector's single static finding (`border-l-4` at line 565) deserves a quick human look to confirm it's decorative rather than a legitimate active-state indicator before acting on it.

## Questions to Consider

- If the 6 sidebar cards are really just "site-wide settings," should they be visually demoted into a collapsible "Settings" drawer instead of looking like a peer list to the content sections?
- Is a second, full-weight "Remove the badge – €19" ask defensible on the very first screen a new host sees, before they've written a single word of their actual site?
- Given that "click any text to edit it" is the *only* confirmed way to edit nearly all real content, has this flow been walked end-to-end by a keyboard-only or screen-reader user?
