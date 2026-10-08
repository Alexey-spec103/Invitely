"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GripVertical,
  Lock,
  Mail,
  MailOpen,
  CalendarDays,
  MapPin,
  CheckCircle2,
  Hourglass,
  Gift,
  Shirt,
  BookOpen,
  Video,
  UtensilsCrossed,
  StickyNote,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { reorderSections, toggleSection, updateEnvelopeReveal } from "./actions";
import {
  SECTION_LABELS,
  SECTION_ICONS,
  SECTION_ORDER,
  type SectionConfig,
  type SectionType,
} from "@/components/sections/registry";
import { BASIC_GATED_SECTION_TYPES } from "@/lib/plans";
import SectionToggleSwitch from "./SectionToggleSwitch";
import PremiumUpgradeModal from "@/components/ui/PremiumUpgradeModal";

// Drawn icons for this list specifically -- flagged live as reading
// "AI-generated" (craft-floor: "Unicode glyphs or emoji standing in for an
// icon system"). MODULE_ICONS below stays the emoji map every other
// consumer (SiteInlineEditor's sidebar rows and section headers) already
// depends on -- widening that shared export's type would ripple through
// ~20 call sites for a cosmetic change scoped to just this one list, so
// this is a second, local-only map instead of touching the shared one.
const MODULE_ICON_COMPONENTS: Partial<Record<SectionType, LucideIcon>> = {
  letter: Mail,
  timeline: CalendarDays,
  map: MapPin,
  rsvp: CheckCircle2,
  countdown: Hourglass,
  gift: Gift,
  dressCode: Shirt,
  guestbook: BookOpen,
  video: Video,
  banquetNavigator: UtensilsCrossed,
  guestNotes: StickyNote,
};

// Every toggleable module, in the app's canonical order -- not derived from
// the `sections` prop, because a module never toggled on yet for this event
// has no entry in `site_config.sections` at all, and still needs a row here
// (that row's toggle is how it gets its first entry, via `toggleSection`).
const ALL_MODULE_TYPES = (Object.keys(SECTION_LABELS) as SectionType[])
  .filter((type) => type !== "hero")
  .sort((a, b) => SECTION_ORDER[a] - SECTION_ORDER[b]);

// dashboard-audit.md (impeccable critique, P1): 11 modules in one flat,
// ungrouped list pushed well past the ~4-items-per-group working-memory
// guideline -- a first-timer had to scan the whole thing to find what they
// wanted. Purely a visual label inserted between runs of the same group in
// whatever order the host has dragged things into; it never constrains
// drag-and-drop itself (the saved order stays one flat list, same as
// before -- a module can still be dragged into any position, a group label
// just stops appearing above it once it's no longer first in its run).
const MODULE_GROUPS: Partial<Record<SectionType, string>> = {
  letter: "Core",
  timeline: "Core",
  map: "Core",
  rsvp: "Core",
  countdown: "Fun extras",
  gift: "Fun extras",
  dressCode: "Fun extras",
  guestbook: "Fun extras",
  video: "Fun extras",
  banquetNavigator: "Logistics",
  guestNotes: "Logistics",
};

interface SectionModulesPanelProps {
  eventId: string;
  sections: SectionConfig[];
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
  hasBasicAccess,
  envelopeRevealEnabled,
}: SectionModulesPanelProps) {
  const router = useRouter();
  const byType = new Map(sections.map((section) => [section.type, section]));
  // Hero excluded -- always on, no row, no drag, order pinned to 0 by
  // reorderSections always receiving "hero" first (see handleDrop). Sorted
  // by each module's saved order where it has one, falling back to the
  // canonical order for a module never toggled on yet.
  const [order, setOrder] = useState<SectionType[]>(
    ALL_MODULE_TYPES.slice().sort(
      (a, b) => (byType.get(a)?.order ?? SECTION_ORDER[a]) - (byType.get(b)?.order ?? SECTION_ORDER[b])
    )
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(ALL_MODULE_TYPES.map((type) => [type, byType.get(type)?.enabled ?? false]))
  );
  const [draggingType, setDraggingType] = useState<SectionType | null>(null);
  const [pendingToggle, setPendingToggle] = useState<SectionType | null>(null);
  // dashboard-audit.md "fresh eyes" finding #2: the 🔒 Basic badge's real
  // meaning (toggle and preview freely -- only the published result is
  // gated) previously lived only in a native `title` tooltip, which needs a
  // sustained hover and doesn't exist at all on touch. Click-to-expand
  // works on both.
  const [expandedGateInfo, setExpandedGateInfo] = useState<SectionType | null>(null);
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
  const [pendingGateModal, setPendingGateModal] = useState<SectionType | null>(null);

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
      setToggleError(err instanceof Error ? err.message : "Failed to save -- please try again.");
    } finally {
      setEnvelopePending(false);
    }
  };

  const handleToggle = async (type: SectionType, next: boolean) => {
    setToggleError(null);
    setEnabled((prev) => ({ ...prev, [type]: next }));
    setPendingToggle(type);
    try {
      const result = await toggleSection(eventId, type, next);
      if (!result.ok) throw new Error(result.message);
      router.refresh();
    } catch (err) {
      setEnabled((prev) => ({ ...prev, [type]: !next }));
      setToggleError(err instanceof Error ? err.message : "Failed to save -- please try again.");
    } finally {
      setPendingToggle(null);
    }
  };

  const requestToggle = (type: SectionType, next: boolean) => {
    if (next && isGatedType(type)) {
      setPendingGateModal(type);
      return;
    }
    handleToggle(type, next);
  };

  const handleDrop = async (targetType: SectionType) => {
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
      setToggleError(err instanceof Error ? err.message : "Failed to save -- please try again.");
    }
  };

  return (
    <div id="site-modules-panel" className="mb-8 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
      <h2 className="dash-h2 text-sm text-[var(--dash-accent)]">Modules</h2>
      <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
        Guests won&apos;t see a module until it&apos;s turned on here — drag to change the order they appear in on your public site.
      </p>
      {toggleError && <p className="mt-1 text-sm text-red-400">{toggleError}</p>}
      <ul className="mt-3 space-y-1">
        {order.map((type, index) => {
          const isGated = isGatedType(type);
          const ModuleIcon = MODULE_ICON_COMPONENTS[type];
          const group = MODULE_GROUPS[type];
          const showGroupLabel = group && group !== MODULE_GROUPS[order[index - 1]];
          return (
          <Fragment key={type}>
          {showGroupLabel && (
            <li
              aria-hidden="true"
              className={`px-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--dash-text-muted)] ${
                index === 0 ? "pb-1" : "pb-1 pt-3"
              }`}
            >
              {group}
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
                {SECTION_LABELS[type]}
                {isGated && (
                  <button
                    type="button"
                    onClick={() => setExpandedGateInfo((prev) => (prev === type ? null : type))}
                    aria-expanded={expandedGateInfo === type}
                    className="flex items-center gap-0.5 rounded-full bg-[color-mix(in_srgb,var(--dash-accent)_18%,transparent)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--dash-accent)]"
                  >
                    <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                    Basic
                  </button>
                )}
              </span>
              <SectionToggleSwitch
                checked={enabled[type]}
                onChange={(next) => requestToggle(type, next)}
                disabled={pendingToggle === type}
                label={`Turn ${SECTION_LABELS[type]} ${enabled[type] ? "off" : "on"}`}
              />
            </div>
            {isGated && expandedGateInfo === type && (
              <p className="border-t border-[var(--dash-border)] px-3 py-2 text-xs text-[var(--dash-text-muted)]">
                Turn this on and preview it freely — it only shows on your published site once you&apos;re on the Basic plan or above.
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
                Add &amp; seat your guests on the Guests tab
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
            Envelope reveal
          </span>
          <SectionToggleSwitch
            checked={envelopeEnabled}
            onChange={handleEnvelopeToggle}
            disabled={envelopePending}
            label={`Turn envelope reveal ${envelopeEnabled ? "off" : "on"}`}
          />
        </div>
        <p className="px-3 pb-1 text-xs text-[var(--dash-text-muted)]">
          A brief animated envelope guests tap open before seeing your site.
        </p>
      </div>

      <PremiumUpgradeModal
        open={pendingGateModal !== null}
        onClose={() => setPendingGateModal(null)}
        eventId={eventId}
        action={pendingGateModal ? `Turning on ${SECTION_LABELS[pendingGateModal]}` : ""}
        targetPlanId="basic"
        consequence="won't show on your published site until you upgrade."
        benefit="show it (and unlock the rest of Basic) on your site"
        canContinueAnyway
        continueLabel="Continue (preview only)"
        onContinueAnyway={() => {
          if (pendingGateModal) handleToggle(pendingGateModal, true);
        }}
      />
    </div>
  );
}
