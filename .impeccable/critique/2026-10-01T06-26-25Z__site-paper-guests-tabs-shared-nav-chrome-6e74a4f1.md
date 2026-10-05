---
target: app/dashboard host cabinet (Style, Site, Paper, Guests tabs + shared nav chrome)
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\AP309\\dev\\invitely\\app\\dashboard (host cabinet: Style, Site, Paper, Guests tabs + shared nav chrome)"
timestamp: 2026-10-01T06-26-25Z
slug: site-paper-guests-tabs-shared-nav-chrome-6e74a4f1
---
Method: dual-agent (A: general-purpose · B: general-purpose)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Autosave is clearly communicated (FirstVisitTour), but failed module-toggle saves silently revert with no error message |
| 2 | Match System / Real World | 4 | Confiding, wedding-specific copy throughout ("Get your link", "Find My Table"); plan-gating copy states the real mechanic instead of hiding it |
| 3 | User Control and Freedom | 3 | Undo/redo on theme choice, simple publish toggle; but event/account deletion only gated by a plain confirm, not typed confirmation |
| 4 | Consistency and Standards | 2 | Two chrome themes in one shell (Style/Guests/Account/Plan light, Site/Paper/Canvas dark) flip instantly with no transition on every rail click |
| 5 | Error Prevention | 2 | Guest "Remove" is a plain text link with no row-level confirm; no undo toast anywhere for destructive actions |
| 6 | Recognition Rather Than Recall | 3 | Status badges and inline previews reduce recall well; same Basic/Premium feature list is repeated near-verbatim in 2-3 separate places |
| 7 | Flexibility and Efficiency | 2 | No bulk guest actions beyond CSV-style import, no keyboard shortcuts, no multi-select |
| 8 | Aesthetic and Minimalist Design | 3 | Individual cards are clean; Site tab's first viewport stacks carousel + tour popup + reminder banner + modules panel all at once |
| 9 | Error Recovery | 2 | Top-level error boundary is well-written and reassuring; inline per-action error visibility is inconsistent across 3 different conventions |
| 10 | Help and Documentation | 3 | Contextual FirstVisitTour is used well; no persistent in-context help beyond an honestly-framed async email widget |
| **Total** | | **27/40** | **Acceptable (upper end, bordering Good)** |

## Design Specificity Verdict

**LLM assessment**: Mostly earned, not generic. Copy is written in a specific, confiding voice, and several structures are wedding-specific (the Style→Site→Paper→Guests funnel, QR-coded personal invitations, banquet seating / "Find My Table"). It would not pass as a generic SaaS admin with labels swapped. The one place that does feel bolted-on generic is Account Settings — a bare white card with an email field and a danger zone, floating in an otherwise empty viewport with no product voice.

**Deterministic scan**: The Impeccable detector (`impeccable detect --json app/dashboard`, 72 files, exit code 0) found exactly **one** antipattern: a "side-tab accent border" (`border-l-4`) flagged as generic-slop styling at `app/dashboard/[eventId]/site/page.tsx:518`. Reading the surrounding code shows this is a deliberate, live-verified replication of a specific reference pattern (documented in an inline comment citing "dashboard-audit.md B13" and a confirmed-live source), not unintentional AI-slop — a genuine false positive, not a real issue. No other antipatterns were found anywhere in the 72-file dashboard tree.

**Visual overlays**: Not available — Assessment B's run didn't get script-injection confirmation; findings here come from the CLI scan and manual screenshot inspection instead.

## Overall Impression

The dashboard is more considered than a template bolt-on — the copy has a voice, the recent Guests/Banquet/Invitations merge left no dead seams (verified: old routes are clean redirects, cross-links between Guests and Site's Find My Table module are explicit), and the live constructor preview is the real site, not a synced mock. The gap is in how much is asked of a host's attention and nerves at once: an 11-item flat module toggle list, a payment pitch repeated in up to three places on one screen, and a delete-event button sitting in the same scroll as the pricing card. None of it is broken — no console errors on any of 5 pages, clean detector scan, clean redirects — but it reads like a product that nailed individual screens without yet asking "how does this feel in sequence, under stress."

## What's Working

1. **The IA merge was executed cleanly.** `app/dashboard/[eventId]/banquet/page.tsx` and `invitations/page.tsx` are pure redirect stubs with no dead UI; the Guests page's Seating section explicitly links forward to what it powers, and the Site module panel cross-links back to Guests when a dependent module is on but unconfigured. No orphaned empty states or stale terminology survived the merge.
2. **The constructor preview is the real site.** `SiteInlineEditor` is confirmed live to be click-to-edit directly on the rendered page, not a form next to a stale iframe — this eliminates an entire class of "my edit doesn't match the preview" bugs common to builder tools.
3. **Plan-gating is honest.** Gated modules can be toggled and previewed freely before purchase, with copy that says so explicitly, and upgrade paths go to real checkout rather than a "contact sales" dead end — this avoids a common SaaS dark pattern.

## Priority Issues

**[P0] No typed/weighted confirmation on irreversible deletes**
- Why it matters: Account deletion and event deletion both gate on what is effectively a basic confirm step with the same visual weight as every other button on the page, despite destroying a real couple's guest list and RSVP history. A stressed or distracted host can end a wedding's entire digital record with one accidental click-through.
- Fix: Require typing the event name (or literal "DELETE") before the delete button enables, matching the gravity the copy already claims ("cannot be undone").
- Suggested command: `/impeccable harden`

**[P1] The paid-upgrade CTA repeats across up to 4 concurrent surfaces with no coordination**
- Why it matters: The header `PlanBadge` pill, Site's sticky footer bar, the `FunnelNav` bottom link, and the Plan page itself all carry near-identical "Get your link — €19" messaging. On the Site tab alone, two of these are visible simultaneously. Individually justified, the aggregate reads as nagging — the opposite of `PlanBadge`'s own stated goal ("informative, not a naggy upsell").
- Fix: Keep one persistent, low-key surface (the header pill already works) and make the others contextual or dismiss-once-seen rather than permanent fixtures.
- Suggested command: `/impeccable quieter`

**[P1] The module toggle list violates basic chunking (11+ flat items, no grouping)**
- Why it matters: A first-time host sees Welcome Letter through Notes for Guests plus Envelope Reveal as one undifferentiated list, several pre-enabled with no inline explanation of what they do until clicked. This pushes well past the ≤4-items-per-group working-memory guideline and makes scanning for "what do I actually want" effortful on the very first visit.
- Fix: Group into 2-3 labeled clusters (e.g. "Core," "Fun extras," "Logistics") — the Paper tab already groups its own materials by kind, so there's an in-product precedent to follow.
- Suggested command: `/impeccable layout`

**[P2] Two chrome themes switch instantly with no transition**
- Why it matters: Style/Guests/Account/Plan render light, Site/Paper/Canvas render dark, by deliberate design (confirmed via code comments distinguishing "hub" vs. "constructor" contexts) — but clicking between adjacent rail items flips the entire header/sidebar from white to near-black with zero transition, every time, for the life of the account. The intent is sound; the execution reads as a layout flash rather than a deliberate mode switch.
- Fix: Either unify the theme, or add a brief cross-fade on the chrome so the switch reads as intentional.
- Suggested command: `/impeccable animate`

**[P3] Inconsistent error visibility across similarly-weighted actions**
- Why it matters: `PublishToggle` surfaces failures inline in red text; `SectionModulesPanel`'s module toggles fail silently with an optimistic revert and no message at all. A host has no way to tell "it didn't work" from "I guess I didn't actually click that."
- Fix: Route all dashboard mutations through one shared toast/inline-error convention.
- Suggested command: `/impeccable harden`

## Persona Red Flags

**Jordan (confused first-timer)**: Lands on the Site tab and is shown a feature carousel, a first-visit-tour popup, and an 11-toggle module list simultaneously — several toggles (Welcome Letter, Schedule, Location, RSVP, Countdown, Dress Code, Find My Table) are pre-enabled on a brand-new event with no inline explanation of what any of them do until clicked. The "Basic" lock badge's real meaning (preview freely, pay only to publish) is hidden behind an extra click — Jordan may assume the whole toggle is blocked and never discover it actually works.

**Riley (stress-tester / high-stakes actions)**: The Plan page puts "Permanently delete this event and everything in it" in the same continuous scroll as the payment CTA — a host rechecking pricing after a declined card scrolls directly past the delete-event button. Guest "Remove" is a same-weight text link next to Copy link/Send/Edit with no row-level confirm, so working through a long guest list carries real misclick risk with no undo.

## Minor Observations

- Default banquet table names are "Table" and "Table 2" — the first table isn't "Table 1," a small numbering inconsistency a detail-oriented host will notice.
- `PlanBadge`'s dropdown and the Plan page both show the full Basic/Premium feature list near-verbatim — the same content re-explained rather than referenced once.
- The Account Settings page renders as a small card pinned top-left in an otherwise full-height empty viewport — reads unfinished next to every other dashboard page's fuller layout.
- `PremiumUpgradeNote` and the Plan page's "what guests see on Free" block use near-identical bold-amber/red warning styling for two very different stakes (a watermark vs. a pricing reminder), diluting the signal for when something is actually urgent.
- One evidence-gathering run reported `/dashboard/account` redirecting to the Plan page; a direct code check of `app/dashboard/account/page.tsx` and `layout.tsx` found no such redirect, so this was most likely a browser-automation tab-tracking artifact during that run, not a real routing bug — worth a quick manual re-check if it recurs, but not treated as a confirmed issue here.

## Questions to Consider

1. What if the light/dark chrome split (hub vs. constructor) were cut entirely — does it still earn its keep, or is it a reference-site pattern that was never re-tested against Invimbo's own simpler funnel?
2. What if the four "Get your link" touchpoints became one always-visible progress indicator ("Style, Site, Paper done — Guests in progress") instead of a repeated price-anchored CTA — would it convert as well while feeling like guidance instead of nagging?
3. What if guest removal, table deletion, and event deletion all shared one soft-delete-plus-undo-toast pattern instead of three different confirm-and-gone conventions — would that single mechanism close most of the error-prevention gaps at once?
