---
target: dashboard Site/Plan/Account pages
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\AP309\\dev\\invitely\\dashboard Site\\Plan\\Account pages (http:\\localhost:3000\\dashboard\\b8f73b23-544f-46be-a741-e6b935054e64\\{site,plan} + http:\\localhost:3000\\dashboard\\account)"
timestamp: 2026-10-26T07-42-46Z
slug: lan-http-localhost-3000-dashboard-account-eeda3ecd
---
Method: dual-agent (A: general-purpose design-director review · B: general-purpose detector + browser evidence). Round 1 of a new critique track -- these pages had not been reviewed in this marathon before.

## Design Health Score (as assessed by A)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Autosave reliable with a "Saving..." pill; Stripe checkout shows pending/success/cancelled states. Docked: no indicator anywhere that another session/device is editing the same event concurrently. |
| 2 | Match Between System & Real World | 4 | Copy is specific and plain-language throughout, no jargon leaks into host-facing text. |
| 3 | User Control and Freedom | 3 | Undo/redo, Esc/Cancel on every modal, instantly-reversible toggles with reassurance copy. Docked: Site's repeatable-item deletes use native `window.confirm()` instead of the app's own styled confirm pattern. |
| 4 | Consistency and Standards | 1 -> **corrected to 3, see "Correction" below** | A's original finding ("Plan/Account are light while Site/Style/Paper/Guests are dark") does not hold up -- verified live myself: Style, Guests, Plan, and Account are ALL deliberately light "hub" pages; only Site/Paper/Canvas are deliberately dark "constructor" pages, exactly as documented in `lib/dashboardChrome.ts`'s `isConstructorRoute()`. What both assessors actually found and what's genuinely real: one real cross-theme bug (white-on-white text, see Priority Issues) and two Account-page-specific defects, both now fixed. |
| 5 | Error Prevention | 4 | Both danger zones (event deletion, account deletion) require typing the exact title/email to enable the delete button -- independently confirmed by B with a real throwaway-event deletion test. |
| 6 | Recognition Rather Than Recall | 3 | "Click any text to edit it in place" + persistent dashed-border outlines solve discoverability well on Site. |
| 7 | Flexibility and Efficiency of Use | 3 | Ctrl+Z/Ctrl+Shift+Z site-wide once a field has been edited, device-preview toggle, drag-to-reorder modules. |
| 8 | Aesthetic and Minimalist Design | 2 -> **corrected to 3, see below** | Site tab itself is clean. Account's severe layout defect (~384px content pinned far-left with ~900px of dead gray space) was real and independently confirmed live -- **fixed since, see below**. |
| 9 | Help Users Recognize, Diagnose, Recover from Errors | 3 | Specific, actionable errors. Stacked, non-clearing error messages on Account's email form were real and independently confirmed live -- **fixed since, see below**. |
| 10 | Help and Documentation | 3 | SupportWidget present dashboard-wide, routes to a real monitored inbox. |

**Total as assessed: 29/40. With heuristic 4 and 8's misdiagnoses corrected and this round's fixes applied, the genuinely-supported total is approximately 33/40** -- see Correction and "Fixed since this assessment" below.

## Correction: the "theme inconsistency" finding was a misdiagnosis

A's single largest claimed finding -- "every page reached from the left-hand nav renders in a cohesive dark theme; Plan and Account render in a plain white theme" -- does not match reality. Verified directly, live, in the browser, on all six pages:

- **Style**: light shell (white header, white sidebar, light gray content background).
- **Guests**: light shell, identical treatment to Style.
- **Plan**: light shell, identical treatment to Style/Guests.
- **Account**: light shell, identical treatment to Style/Guests/Plan.
- **Site**: dark shell (black header, black sidebar) -- deliberately.
- **Paper**: dark shell (black header, black sidebar), light content cards within it -- deliberately.

This is not accidental or inconsistent -- `lib/dashboardChrome.ts` implements `isConstructorRoute(pathname, eventId)`, explicitly documented: *"the shell chrome (header + rail) is dark only on the actual constructor screens (Site, Paper, Canvas); every other cabinet screen is light."* `DashboardShell.tsx` applies `LIGHT_HEADER_VARS` to every route except those three. Plan and Account were never the odd ones out -- they're correctly grouped with Style and Guests, exactly as designed. A's test apparently compared Site (dark, correctly) against Plan/Account (light, correctly) and concluded the latter were unfinished, without checking whether Style/Guests (also light) were themselves consistent with Plan/Account -- they are.

This correction was made through code reading (`lib/dashboardChrome.ts`, `DashboardShell.tsx`) and live navigation across all six pages in the same browser session, not taken on faith from either assessor.

## Design Specificity Verdict

**A's assessment:** Strongly product-specific, not template-interchangeable. The copy constantly reasons about this product's actual constraints -- the real mocked-up preview of the "Made with Invimbo" badge a Free host will actually see, the honest "Premium only removes the watermark, doesn't change the link" framing, the anonymous-trial-to-account upgrade modal built specifically because this app lets people design before signing up.

**B's deterministic scan:** One finding, chased down and ruled out as a false positive (an intentional, weddingpost.ru-parity-matched accent border, not generic AI slop). Otherwise clean across all five scanned directories.

## Genuine findings, independently confirmed by both assessors and now fixed

**1. [Real P1] White-on-white invisible text in Site's "Bring your own domain" input.** `DomainEditForm.tsx`'s `ByodDomainForm` wraps its domain input in a hardcoded light `bg-gray-50` card (an intentional, deliberate break from Site's otherwise-dark theme for this one sub-panel) but used the DARK-theme input variant `dash-input-dark` (white text) plus `--dash-text-muted`/`text-red-400` (light-theme-appropriate colors meant for dark surfaces) for its label and error text -- reproducing, in reverse, the exact "illegible text" bug `dash-input-dark` was originally built to fix. B confirmed via computed styles: typed text rendered at `color: rgb(244, 244, 246)` on a `rgb(255,255,255)`-adjacent background, contrast ratio ~1:1. Fixed by switching the input to the same boxed light-theme style already used by its sibling subdomain input two sections above (`border-gray-300 bg-white text-gray-900`), and its label/error text to `text-gray-700`/`text-red-600`, matching the card's own light background. Re-verified live after the fix: typed "mysite.com" renders as near-black text (`lab(8.1...)`) on white, clearly legible, confirmed both via computed-style inspection and a visual screenshot.

**2. [Real P1] Account settings page layout defect.** `app/dashboard/account/page.tsx`'s root wrapper used `max-w-sm` (384px) with no centering, leaving the entire page pinned to the far left of the viewport with ~900px of dead gray space -- confirmed by both A (live screenshot at 1288px width) and independently by myself via direct code read. Fixed by widening to `max-w-2xl`, matching how every other cabinet page's content fills (or nearly fills) `main`'s own width rather than imposing an unusually tight cap of its own. Re-verified live: content now spans a reasonable width consistent with Plan's card sizing, no dead zone.

**3. [Real P3] Stacked, non-clearing error messages on Account's email form.** `AccountForm.tsx`'s `formError` state (server/business-rule errors like "that's already your current email") was only ever cleared inside `onSubmit`, which react-hook-form never calls once client-side zod validation starts failing first -- so a stale `formError` kept showing simultaneously with a fresh, unrelated zod validation error. Confirmed live by A. Fixed by clearing `formError` on every keystroke via `register("email", { onChange: () => setFormError(null) })`. Re-verified live: triggering the business-rule error, then typing an invalid address, now shows only the current, relevant error.

## What's Working

1. **Both danger zones (event deletion, account deletion) are well-guarded and real** -- B independently created and fully deleted a throwaway event through the typed-confirmation flow, confirming it actually works end-to-end, not just that the UI looks right.
2. **The previously-fixed inline-editor toolbar/blur bug stays fixed** -- B specifically re-ran the exact repro (type, then click Bold without blurring first, then reload) and confirmed the text and formatting both persist correctly.
3. **Plan's tier framing avoids the classic three-equal-cards trap** -- Basic is the featured, default result; Free is demoted to an honest "here's what you're giving up" preview rather than hidden; Premium is scoped honestly to paper-only rather than implying a bigger/better bundle.
4. **Accessibility basics hold** -- B ruled out two initial false positives (decorative SVGs correctly marked, a hidden file input with an adjacent labeled button) and confirmed 0 genuine missing-alt or unlabeled-input issues across Site/Plan/Account.

## Priority Issues

- **[P2] Native `window.confirm()` for Site's repeatable-item deletes** (`SiteInlineEditor.tsx`'s `confirmAndDelete`), inconsistent with the app's own styled, Cancel-able confirmation pattern used for event/account deletion. Not addressed this round -- this app has an established, deliberate pattern from earlier in this session (native `confirm()` for rare/deliberate actions vs. styled undo-toast for frequent ones); whether a per-FAQ-item/timeline-event delete counts as "rare" enough to keep native `confirm()` is a judgment call, not re-litigated here.
- **[P3] Plan's tier cards have no explicit "Current plan" badge** -- status is only inferable from surrounding prose, confirmed by B. Not addressed this round.
- **[P3] No password-change option on Account settings**, despite the product supporting password-based auth elsewhere (Plan's anonymous-upgrade modal collects one). Not addressed this round -- would need confirming whether a separate reset-password flow already exists before scoping a fix.
- **[P3] FAQ's large decorative dead-zone** between the edit card and its own rendered preview text, pushing the editor/preview connection further apart than elsewhere on Site. Not addressed this round.

## Persona Red Flags

**Riley (co-planning partner, concurrent-editing scenario)**: both assessors independently observed live interference from a second concurrent session during testing (scroll jumps, a stray test string appearing mid-edit). The codebase has deliberate, field-specific dirty-tracking guards (`weddingDataDirtyRef`, `mapDirtyRef`) against exactly this, but no user-visible "someone else is editing" signal exists anywhere -- the same open architectural question already tracked in the separate Style/Paper/Guests critique track.

**Jordan (first-timer)**: the Account-page layout defect (now fixed) would have read as a broken/incomplete page at exactly the moment someone is checking on their account or considering deletion -- the wrong page to feel unfinished on.

## Minor Observations

- `GiftWishesManager.tsx` and `PasswordProtectionCard.tsx` also use `dash-input-dark` but were confirmed (via code read, not just inference) to have no light-background wrapper anywhere in either file -- genuinely unaffected by the same bug class, no action needed.
- The avatar dropdown (Plan / Account settings / Sign out) truncates the email with no tooltip -- minor, low-impact.

## Questions to Consider

1. Now that the one real cross-theme color-token bug is fixed, is it worth a quick grep for other `dash-input-dark`/`--dash-text-muted`/`text-*-400` usages anywhere else in the app that might sit inside an unexpected light-background card, the same way this one did?
2. Is multi-device/multi-partner concurrent editing an explicitly supported scenario? This is now the second independent critique track to reproduce the same silent-overwrite risk.
