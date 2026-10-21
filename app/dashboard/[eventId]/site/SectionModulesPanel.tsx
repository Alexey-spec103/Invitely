"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GripVertical, Lock, MailOpen, ArrowRight } from "lucide-react";
import { reorderSections, toggleSection, updateEnvelopeReveal } from "./actions";
import {
  SECTION_LABELS,
  SECTION_ICONS,
  SECTION_ORDER,
  sectionWillRender,
  type SectionConfig,
  type SectionType,
} from "@/components/sections/registry";
import { BASIC_GATED_SECTION_TYPES } from "@/lib/plans";
import SectionToggleSwitch from "./SectionToggleSwitch";
import PremiumUpgradeModal from "@/components/ui/PremiumUpgradeModal";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

// Hero is always-on with no toggle row (see below) and has no entry in
// `t.labels`/`t.groups` -- this alias lets every piece of local state that
// only ever holds a toggleable module's type say so in its own signature,
// instead of the broader SectionType (hero included) that would otherwise
// make every `t.labels[type]` lookup below a type error.
type ModuleType = Exclude<SectionType, "hero">;

// Every toggleable module, in the app's canonical order -- not derived from
// the `sections` prop, because a module never toggled on yet for this event
// has no entry in `site_config.sections` at all, and still needs a row here
// (that row's toggle is how it gets its first entry, via `toggleSection`).
const ALL_MODULE_TYPES = (Object.keys(SECTION_LABELS) as SectionType[])
  .filter((type): type is ModuleType => type !== "hero")
  .sort((a, b) => SECTION_ORDER[a] - SECTION_ORDER[b]);

// dashboard-audit.md (impeccable critique, P1): 11 modules in one flat,
// ungrouped list pushed well past the ~4-items-per-group working-memory
// guideline -- a first-timer had to scan the whole thing to find what they
// wanted. Purely a visual label inserted between runs of the same group in
// whatever order the host has dragged things into; it never constrains
// drag-and-drop itself (the saved order stays one flat list, same as
// before -- a module can still be dragged into any position, a group label
// just stops appearing above it once it's no longer first in its run).
const MODULE_GROUP_KEYS: Partial<Record<SectionType, "core" | "funExtras" | "logistics">> = {
  letter: "core",
  timeline: "core",
  map: "core",
  rsvp: "core",
  countdown: "funExtras",
  gift: "funExtras",
  dressCode: "funExtras",
  guestbook: "funExtras",
  video: "funExtras",
  banquetNavigator: "logistics",
  guestNotes: "logistics",
  faq: "logistics",
  travel: "logistics",
};

interface SectionModulesPanelProps {
  eventId: string;
  sections: SectionConfig[];
  /** Per-section content, keyed by `SectionType` (same shape `site_config.
   * content` parses into) -- used only to flag a module that's ON but has
   * nothing to show yet (see `isEmptyWhileEnabled` below), via the same
   * `sectionWillRender` check the public site and the live editor already
   * use to decide whether to render a section at all. Usability walkthrough
   * 2026-10-21, major finding: a host had a module toggled on that rendered
   * nothing on the guest site, with zero indication here of why. */
  content: Record<string, unknown>;
  /** dashboard-audit.md Block E part 1: whether the event's plan meets
   * Basic. Toggling a gated module ON still works (that's the free "try it"
   * part) -- but now goes through PremiumUpgradeModal first (audit finding:
   * the toggle used to just flip with zero sign anything was gated, and the
   * module would then silently never render for guests), since the real
   * enforcement lives in app/e/[slug]/page.tsx's public render. Turning one
   * back off never needs the modal. */
  hasBasicAccess: boolean;
  /** Whether EnvelopeReveal shows on the public site's first visit -- a
   * site-wide setting (content.settings.envelopeRevealEnabled), not a real
   * `sections[]` entry, but toggled from right here for the same on/off UX
   * as every other module. */
  envelopeRevealEnabled: boolean;
  /** Host locale, not a pre-resolved `t` object -- this is "use client" and
   * several of its strings (toggleAriaLabel, upgradeModal.action) are
   * functions in the dictionary, which the server-component caller
   * (page.tsx) can't pass as a prop across the server/client boundary
   * (confirmed live: "Functions cannot be passed directly to Client
   * Components"). Resolved internally via getDictionary(locale) instead,
   * same fix as ModuleCard's own `locale` prop. See
   * lib/i18n/translations/en.ts's `dashboard` namespace comment.
   * Deliberately separate from `SECTION_LABELS` (shared with the
   * guest-facing nav, out of scope here) so this panel's labels can be
   * localized without touching that. */
  locale: Locale;
}

// Decorative only -- weddingpost.ru's own module column has its own icon
// set (dashboard-audit.md 3.3), not something to copy pixel-for-pixel.
// Hero has no row here (no icon needed): it's always on, matching
// SiteInlineEditor's existing "no toggle for Hero" convention. Re-exported
// from the shared registry (not a second copy of the same emoji map) now
// that the guest-facing nav (components/shell/SiteHeader.tsx) needs the
// exact same per-section icon too -- see SECTION_ICONS's own comment.
export const MODULE_ICONS = SECTION_ICONS;

/** landing-audit.md counterpart for the dashboard: dashboard-audit.md A1.
 * Replaces the old arrow-reorder `Section order` list -- this is now the
 * single place that turns modules on/off (SiteInlineEditor's per-section
 * headers used to have their own toggle too; removed in favor of this one
 * panel, matching weddingpost.ru's own single "Модули" column). */
export default function SectionModulesPanel({
  eventId,
  sections,
  content,
  hasBasicAccess,
  envelopeRevealEnabled,
  locale,
}: SectionModulesPanelProps) {
  const router = useRouter();
  const t = getDictionary(locale).dashboard.site.modules;
  const byType = new Map(sections.map((section) => [section.type, section]));
  // Hero excluded -- always on, no row, no drag, order pinned to 0 by
  // reorderSections always receiving "hero" first (see handleDrop). Sorted
  // by each module's saved order where it has one, falling back to the
  // canonical order for a module never toggled on yet.
  const [order, setOrder] = useState<ModuleType[]>(
    ALL_MODULE_TYPES.slice().sort(
      (a, b) => (byType.get(a)?.order ?? SECTION_ORDER[a]) - (byType.get(b)?.order ?? SECTION_ORDER[b])
    )
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(ALL_MODULE_TYPES.map((type) => [type, byType.get(type)?.enabled ?? false]))
  );

  // On but `sectionWillRender` says there's currently nothing to show --
  // informational, not an error: visually distinct from "intentionally
  // off," which already reads clearly from the toggle itself. Reads the
  // live `enabled` state (not the server-rendered `sections` prop) so
  // flipping a toggle updates this immediately, without waiting on a
  // `router.refresh()`. Usability walkthrough 2026-10-21, major finding: a
  // host had a module toggled on that silently rendered nothing on the
  // guest site, with zero indication here of why.
  const isEmptyWhileEnabled = (type: ModuleType) => {
    if (!enabled[type]) return false;
    const section = byType.get(type);
    const fallback: SectionConfig = { type, variant: "", order: SECTION_ORDER[type], enabled: true };
    return !sectionWillRender(section ?? fallback, content);
  };

  const [draggingType, setDraggingType] = useState<ModuleType | null>(null);
  const [pendingToggle, setPendingToggle] = useState<ModuleType | null>(null);
  // dashboard-audit.md "fresh eyes" finding #2: the 🔒 Basic badge's real
  // meaning (toggle and preview freely -- only the published result is
  // gated) previously lived only in a native `title` tooltip, which needs a
  // sustained hover and doesn't exist at all on touch. Click-to-expand
  // works on both.
  const [expandedGateInfo, setExpandedGateInfo] = useState<ModuleType | null>(null);
  const [envelopeEnabled, setEnvelopeEnabled] = useState(envelopeRevealEnabled);
  const [envelopePending, setEnvelopePending] = useState(false);
  // impeccable critique P3: a failed toggle used to revert silently --
  // visually identical to "I guess I didn't actually click that" -- while
  // PublishToggle right above this panel already surfaces its own failures
  // inline. One shared message slot for every toggle in this panel, same
  // red-text convention PublishToggle uses.
  const [toggleError, setToggleError] = useState<string | null>(null);
  // Audit finding: turning a gated module ON used to just flip the switch,
  // identical in look to an unlocked one, while it would silently never
  // render for guests. Same "modal before the action, Continue anyway does
  // it" pattern Paper's PremiumUpgradeModal already uses for watermarked
  // downloads -- turning OFF never routes through this.
  const [pendingGateModal, setPendingGateModal] = useState<ModuleType | null>(null);

  const isGatedType = (type: SectionType) =>
    !hasBasicAccess && (BASIC_GATED_SECTION_TYPES as readonly string[]).includes(type);

  const handleEnvelopeToggle = async (next: boolean) => {
    setToggleError(null);
    setEnvelopeEnabled(next);
    setEnvelopePending(true);
    try {
      const result = await updateEnvelopeReveal(eventId, next);
      if (!result.ok) throw new Error(result.message);
      router.refresh();
    } catch (err) {
      setEnvelopeEnabled(!next);
      setToggleError(err instanceof Error ? err.message : t.failedToSave);
    } finally {
      setEnvelopePending(false);
    }
  };

  const handleToggle = async (type: ModuleType, next: boolean) => {
    setToggleError(null);
    setEnabled((prev) => ({ ...prev, [type]: next }));
    setPendingToggle(type);
    try {
      const result = await toggleSection(eventId, type, next);
      if (!result.ok) throw new Error(result.message);
      router.refresh();
    } catch (err) {
      setEnabled((prev) => ({ ...prev, [type]: !next }));
      setToggleError(err instanceof Error ? err.message : t.failedToSave);
    } finally {
      setPendingToggle(null);
    }
  };

  const requestToggle = (type: ModuleType, next: boolean) => {
    if (next && isGatedType(type)) {
      setPendingGateModal(type);
      return;
    }
    handleToggle(type, next);
  };

  const handleDrop = async (targetType: ModuleType) => {
    if (!draggingType || draggingType === targetType) {
      setDraggingType(null);
      return;
    }
    const previous = order;
    const fromIndex = order.indexOf(draggingType);
    const toIndex = order.indexOf(targetType);
    const next = order.slice();
    next.splice(fromIndex, 1);
    next.splice(toIndex, 0, draggingType);
    setOrder(next);
    setDraggingType(null);
    setToggleError(null);
    // Same gap as the toggle writes above used to have: this used to fire
    // and forget, so a failed reorder left the drag looking like it
    // worked (new position kept locally) while the saved order never
    // actually changed.
    try {
      const result = await reorderSections(eventId, ["hero", ...next]);
      if (!result.ok) {
        setOrder(previous);
        setToggleError(result.message);
        return;
      }
      router.refresh();
    } catch (err) {
      setOrder(previous);
      setToggleError(err instanceof Error ? err.message : t.failedToSave);
    }
  };

  return (
    <div id="site-modules-panel" className="mb-8 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
      <h2 className="dash-h2 text-sm text-[var(--dash-accent)]">{t.heading}</h2>
      <p className="mt-1 text-xs text-[var(--dash-text-muted)]">{t.description}</p>
      {toggleError && <p className="mt-1 text-sm text-red-400">{toggleError}</p>}
      <ul className="mt-3 space-y-1">
        {order.map((type, index) => {
          const isGated = isGatedType(type);
          const ModuleIcon = SECTION_ICONS[type];
          const groupKey = MODULE_GROUP_KEYS[type];
          const showGroupLabel = groupKey && groupKey !== MODULE_GROUP_KEYS[order[index - 1]];
          return (
          <Fragment key={type}>
          {showGroupLabel && (
            <li
              aria-hidden="true"
              className={`px-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--dash-text-muted)] ${
                index === 0 ? "pb-1" : "pb-1 pt-3"
              }`}
            >
              {t.groups[groupKey]}
            </li>
          )}
          <li
            draggable
            onDragStart={() => setDraggingType(type)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(type)}
            onDragEnd={() => setDraggingType(null)}
            className="rounded-md bg-[var(--dash-surface-2)]"
          >
            <div
              className={`flex cursor-grab items-center justify-between px-3 py-1.5 text-sm text-[var(--dash-text)] active:cursor-grabbing ${
                draggingType === type ? "opacity-40" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-[var(--dash-text-muted)]" aria-hidden="true" />
                {ModuleIcon && (
                  <ModuleIcon className="h-3.5 w-3.5 shrink-0 text-[var(--dash-text-muted)]" aria-hidden="true" />
                )}
                {t.labels[type]}
                {isGated && (
                  <button
                    type="button"
                    onClick={() => setExpandedGateInfo((prev) => (prev === type ? null : type))}
                    aria-expanded={expandedGateInfo === type}
                    className="flex items-center gap-0.5 rounded-full bg-[color-mix(in_srgb,var(--dash-accent)_18%,transparent)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--dash-accent)]"
                  >
                    <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                    {t.basicBadge}
                  </button>
                )}
                {!isGated && isEmptyWhileEnabled(type) && (
                  <span
                    title={t.emptyBadgeHint}
                    className="rounded-full bg-[color-mix(in_srgb,var(--dash-text-muted)_18%,transparent)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--dash-text-muted)]"
                  >
                    {t.emptyBadge}
                  </span>
                )}
              </span>
              <SectionToggleSwitch
                checked={enabled[type]}
                onChange={(next) => requestToggle(type, next)}
                disabled={pendingToggle === type}
                label={t.toggleAriaLabel(t.labels[type], !enabled[type])}
              />
            </div>
            {/* UX audit (2026-10-12): this used to only appear after clicking
                the small "Basic" badge -- easy to never discover, which left
                a gated module's toggle in an ambiguous state once switched
                on (is it configuring something guests can't see yet, or is
                it inert?). Now it also shows automatically once the module
                is actually ON, the moment that ambiguity exists; the
                click-to-expand badge still works too, for previewing the
                explanation before turning it on. */}
            {isGated && (enabled[type] || expandedGateInfo === type) && (
              <p className="border-t border-[var(--dash-border)] px-3 py-2 text-xs text-[var(--dash-text-muted)]">
                {enabled[type] ? t.gatedOnButHidden : t.gatedPreviewOnly}
              </p>
            )}
            {/* Direct feedback: turning this on doesn't do anything by
                itself -- a guest can only find their table once the host has
                actually added guests and seated them, which happens on the
                Guests tab (not here). Without this, a host had no way to
                know where that step even was. */}
            {type === "banquetNavigator" && enabled[type] && (
              <Link
                href={`/dashboard/${eventId}/guests`}
                className="flex items-center gap-1 border-t border-[var(--dash-border)] px-3 py-2 text-xs font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)]"
              >
                {t.addSeatGuestsLink}
                <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
              </Link>
            )}
          </li>
          </Fragment>
          );
        })}
      </ul>

      {/* Not a draggable row like the modules above -- EnvelopeReveal has no
          position in the page flow to reorder, it's a one-off moment before
          the site even starts rendering. Same toggle-switch look as every
          module above for a consistent on/off UX, just its own row. */}
      <div className="mt-3 border-t border-[var(--dash-border)] pt-3">
        <div className="flex items-center justify-between px-3 py-1.5 text-sm text-[var(--dash-text)]">
          <span className="flex items-center gap-2">
            <MailOpen className="h-3.5 w-3.5 shrink-0 text-[var(--dash-text-muted)]" aria-hidden="true" />
            {t.envelopeReveal.label}
          </span>
          <SectionToggleSwitch
            checked={envelopeEnabled}
            onChange={handleEnvelopeToggle}
            disabled={envelopePending}
            label={t.envelopeReveal.toggleAriaLabel(!envelopeEnabled)}
          />
        </div>
        <p className="px-3 pb-1 text-xs text-[var(--dash-text-muted)]">{t.envelopeReveal.description}</p>
      </div>

      <PremiumUpgradeModal
        open={pendingGateModal !== null}
        onClose={() => setPendingGateModal(null)}
        eventId={eventId}
        action={pendingGateModal ? t.upgradeModal.action(t.labels[pendingGateModal]) : ""}
        targetPlanId="basic"
        consequence={t.upgradeModal.consequence}
        benefit={t.upgradeModal.benefit}
        canContinueAnyway
        continueLabel={t.upgradeModal.continueLabel}
        onContinueAnyway={() => {
          if (pendingGateModal) handleToggle(pendingGateModal, true);
        }}
        locale={locale}
      />
    </div>
  );
}
