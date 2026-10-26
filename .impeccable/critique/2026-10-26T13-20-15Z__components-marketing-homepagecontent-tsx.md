---
target: marketing homepage (clarity/cognitive-load pass)
total_score: 21
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\AP309\\dev\\invitely\\components\\marketing\\HomePageContent.tsx"
target_fingerprint: "sha256:8d604fb90273319314addabb47aefa3c5d70ab2570565d93ca62b70f86b2fc64"
target_path: "C:\\Users\\AP309\\dev\\invitely\\components\\marketing\\HomePageContent.tsx"
timestamp: 2026-10-26T13-20-15Z
slug: components-marketing-homepagecontent-tsx
---
Method: dual-agent (A: general-purpose homepage design review · B: general-purpose homepage detector evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Hero carousel auto-advances with no visible pause control beyond small dots |
| 2 | Match System / Real World | 2 | "Every celebration gets its own site" (12 event types) directly contradicted by "A wedding platform, not just an invitation" one scroll later |
| 3 | User Control and Freedom | 3 | No dead ends; skip-link present; carousel can't be manually paused |
| 4 | Consistency and Standards | 2 | Wedding-vs-any-event contradiction recurs across sections; Basic pricing tier has no benefit badge unlike Free/Premium |
| 5 | Error Prevention | 3 | Free tier's watermark trade-off disclosed proactively in an amber callout |
| 6 | Recognition Rather Than Recall | 3 | Sticky nav anchors every major section; distinct verb-led CTAs per section |
| 7 | Flexibility and Efficiency | n/a | Persuade surface — linear scroll, no power-user path expected |
| 8 | Aesthetic and Minimalist Design | 2 | Constructor feature grid and "How the constructor works" re-explain the same builder experience back to back |
| 9 | Error Recovery | 3 | FAQ pre-empts the likely objections right before the final CTA |
| 10 | Help and Documentation | n/a | Not applicable to a marketing page |
| **Total** | | **21/32** | **Acceptable (66%)** |

## Design Specificity Verdict

**LLM assessment**: Mixed in a telling way. The *content* is genuinely authored for this product — real invitation/banquet-card mockups, QR-code RSVP, a live guest-tracking table, seating-card previews, "one-time, not a subscription" badges answering a wedding-specific financial anxiety. But the macro-structure (hero → how it works → feature grid → stat bar → pricing → FAQ → final CTA) is the generic shape of any SaaS landing page, and it hasn't committed to one identity within that shape: every visual proof point (hero video, 9/9 showcased themes, the one named constructor example, the final-CTA photo) is a wedding, while the page simultaneously claims to serve 12 event types.

**Deterministic scan**: `impeccable detect` returned clean (0 findings) on both the component file and the `components/marketing/` directory — this is a static source-pattern scanner and doesn't see DOM-level issues. Live DOM evidence instead: 88 images, 0 missing alt (full pass). Console clean of app-originated errors. 16 unique CTA labels site-wide, no inconsistent labeling for the same action.

**New finding not from prior rounds**: contrast check on the theme-card caption "yourname.com" (muted secondary text, 8.8px) measured **3.86:1** against its background — fails WCAG AA's 4.5:1 for normal text.

**Resolved, not a live issue**: Assessment B also re-tested the "duplicate un-announced h1" heading-hierarchy bug documented in this session's own earlier fix (aria-hidden added to every decorative Hero/Letter mockup on 2026-10-26). Raw DOM still shows 25 `<h1>` elements (artifact of hidden decorative content), but the **accessible tree** (excluding `aria-hidden` ancestors) is clean: exactly 1 `<h1>`, 0 skipped levels. Confirmed fixed, not a regression.

## Overall Impression

The page sells the *craft* of the product well — pricing transparency, FAQ placement, and CTA discipline are all genuinely well executed. But it has not decided what it is: a wedding platform or an any-celebration platform. It asserts both, back to back, with zero supporting evidence for the "any celebration" half downstream of the event-type picker. That's the single biggest opportunity here — not a missing feature, a missing decision.

## What's Working

1. **FAQ placement and content** — sits directly before the final CTA and answers the exact objections a hesitant, high-stakes buyer would have, in native keyboard-accessible `<details>`.
2. **Pricing transparency** — the Free tier's one real trade-off (watermark) is a visible amber callout, not fine print, disclosed before commitment.
3. **CTA labeling discipline** — distinct, accurate verb per section ("Create your website," "Start building," "Pick your event type") instead of one repeated generic label.

## Priority Issues

**[P0] The "wedding platform" headline directly contradicts the section immediately above it**
- **Why it matters**: A first-time visitor planning anything other than a wedding has to wonder whether they clicked into the wrong product, right after the page spent an entire section (12 event-type cards) courting them specifically.
- **Fix**: Reframe the PlatformFanSection headline to be event-agnostic (the underlying feature — one style across site/paper/banquet cards — is already true for every event type shown), or explicitly scope it ("For weddings, we go further: ...").
- **Suggested command**: /impeccable clarify

**[P1] Every proof asset after the event-type grid is wedding-only**
- **Why it matters**: All 9 showcased themes, both decorative hero/CTA videos, and the one named constructor example ("Claire & Nathaniel") are weddings. A visitor who picked Corporate/Graduation/Birthday in their head sees zero evidence the product serves them — makes "Pick your event type" feel decorative, not functional.
- **Fix**: Swap 2-3 of the 9 showcased themes for non-wedding examples, or add visible per-event-type filtering to the showcase.
- **Suggested command**: /impeccable audit, then /impeccable adapt

**[P1] Redundant back-to-back "how the builder works" content**
- **Why it matters**: The Constructor feature grid and the 4-step "How the constructor works" walkthrough cover largely the same ground immediately after each other — reads as padding on an already-long page, not reinforcement.
- **Fix**: Merge into one section, or clearly differentiate roles with a transition sentence explaining why both exist.
- **Suggested command**: /impeccable distill

**[P2] Three flat 9-14-item grids violate the ≤4-item chunking guideline**
- **Why it matters**: EventTypes (12), Themes showcase (9), What's Included (14) are each one undifferentiated grid with no subheadings — forces long monotonous scanning with no landmarks to re-orient against.
- **Fix**: Group What's Included by category (Guest-facing / Planning tools / Paper & print) with subheads.
- **Suggested command**: /impeccable layout

**[P2] "yourname.com" theme-card caption fails WCAG AA contrast (3.86:1, needs 4.5:1)**
- **Why it matters**: Small, muted text below the legibility threshold on every single theme card across the site.
- **Fix**: Darken the caption color or increase its weight/size.
- **Suggested command**: /impeccable audit

**[P3] Basic pricing tier has no benefit badge, unlike Free ("Always free") and Premium ("Removes the watermark")**
- **Why it matters**: A skimmer reading only badges gets a clear reason to pick Free or Premium, none for Basic.
- **Fix**: Give Basic a short badge matching the pattern (e.g., "Your own domain").
- **Suggested command**: /impeccable clarify

## Persona Red Flags

**Jordan (First-Timer)**: Primed by the hero (ring video, "Brides of 2027" caption) to think "wedding site builder." Two sections later sees Birthday/Corporate/Graduation/Quinceañera cards and recalibrates to "oh, it's for anything" — then immediately hits "A wedding platform, not just an invitation" and has to second-guess what they just read. Nothing downstream (all-wedding theme gallery, all-wedding constructor example) resolves the doubt if Jordan isn't planning a wedding. Realistic outcome: assumes the event-type picker was marketing filler and leaves, or proceeds uncertain whether the tool will actually suit their event.

**Riley (Stress Tester)**: Pricing math checks out (watermark trade-off disclosed, "not a subscription" repeated consistently). Tests the "any event" claim against its own evidence and finds it thin — 9/9 showcased themes, 100% of video/photo assets, and the one concrete constructor example are all weddings. Conclusion: "the event-type picker is cosmetic." Also flags Basic's missing badge as an unexplained tier.

**Casey (Mobile)**: *Inferred from responsive source classes, not directly observed — mobile viewport testing was blocked by a tooling limitation this session.* EventTypes grid renders `grid-cols-2` at the smallest breakpoint — the 12-card grid becomes ~6 screens of scrolling before the next section, combined with a sticky announcement bar + header eating vertical space on every screen.

## Minor Observations

- "Brides of 2027, you're going to love this 😳💍" is the only copy on the page naming a gender specifically; every other instance says "couples" — an outlier against the page's own established neutral voice.
- The footer tagline "Event websites, live in minutes." is the single clearest, least contradictory sentence on the page — ironic given how far downstream it sits.
- The top announcement bar leads with "Visa/Mastercard accepted" — pre-empts a payment-method objection nobody has yet, instead of reinforcing the core value prop in that prime above-the-fold slot.
- Header nav has no direct link to the FAQ section (`#faq` exists in the page but isn't in the nav).
- Basic tier's "what this adds" list doesn't restate "Everything in Free" — relies entirely on the "WHAT THIS ADDS" label to imply cumulativeness.

## Questions to Consider

- If every showcased visual on the page is a wedding, is "12 event types" a product decision the design hasn't caught up to, or a marketing claim ahead of the product?
- Between "breadth" (any celebration) and "depth" (the best wedding tool), which story should lead — and what happens if one is promoted to the headline and the other demoted to a supporting line?
- The Constructor feature grid and the 4-step walkthrough both sell the same builder experience from different angles — if you could keep only one, which would a skeptical visitor actually need?
