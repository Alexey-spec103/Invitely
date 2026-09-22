"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reorderSections, toggleSection, updateEnvelopeReveal } from "./actions";
import { SECTION_LABELS, SECTION_ORDER, type SectionConfig, type SectionType } from "@/components/sections/registry";
import { BASIC_GATED_SECTION_TYPES } from "@/lib/plans";

// Every toggleable module, in the app's canonical order -- not derived from
// the `sections` prop, because a module never toggled on yet for this event
// has no entry in `site_config.sections` at all, and still needs a row here
// (that row's toggle is how it gets its first entry, via `toggleSection`).
const ALL_MODULE_TYPES = (Object.keys(SECTION_LABELS) as SectionType[])
  .filter((type) => type !== "hero")
  .sort((a, b) => SECTION_ORDER[a] - SECTION_ORDER[b]);

interface SectionModulesPanelProps {
  eventId: string;
  sections: SectionConfig[];
  /** dashboard-audit.md Block E part 1: whether the event's plan meets
   * Basic. Toggling a gated module stays available regardless (that's the
   * free "try it" part) -- this only drives the lock hint below, since the
   * real enforcement lives in app/e/[slug]/page.tsx's public render. */
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
// SiteInlineEditor's existing "no toggle for Hero" convention.
const MODULE_ICONS: Partial<Record<SectionType, string>> = {
  letter: "💌",
  timeline: "🗓️",
  map: "📍",
  rsvp: "✅",
  countdown: "⏳",
  gift: "🎁",
  dressCode: "👔",
  guestbook: "📖",
  video: "🎥",
  banquetNavigator: "🍽️",
};

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

  const handleEnvelopeToggle = async (next: boolean) => {
    setEnvelopeEnabled(next);
    setEnvelopePending(true);
    try {
      const result = await updateEnvelopeReveal(eventId, next);
      if (!result.ok) throw new Error(result.message);
      router.refresh();
    } catch {
      setEnvelopeEnabled(!next);
    } finally {
      setEnvelopePending(false);
    }
  };

  const handleToggle = async (type: SectionType, next: boolean) => {
    setEnabled((prev) => ({ ...prev, [type]: next }));
    setPendingToggle(type);
    try {
      const result = await toggleSection(eventId, type, next);
      if (!result.ok) throw new Error(result.message);
      router.refresh();
    } catch {
      setEnabled((prev) => ({ ...prev, [type]: !next }));
    } finally {
      setPendingToggle(null);
    }
  };

  const handleDrop = async (targetType: SectionType) => {
    if (!draggingType || draggingType === targetType) {
      setDraggingType(null);
      return;
    }
    const fromIndex = order.indexOf(draggingType);
    const toIndex = order.indexOf(targetType);
    const next = order.slice();
    next.splice(fromIndex, 1);
    next.splice(toIndex, 0, draggingType);
    setOrder(next);
    setDraggingType(null);
    await reorderSections(eventId, ["hero", ...next]);
    router.refresh();
  };

  return (
    <div className="mb-8 rounded-[22px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
      <h2 className="dash-h2 text-sm text-[var(--dash-accent)]">Modules</h2>
      <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
        Guests won&apos;t see a module until it&apos;s turned on here — drag to change the order they appear in on your public site.
      </p>
      <ul className="mt-3 space-y-1">
        {order.map((type) => {
          const isGated =
            !hasBasicAccess && (BASIC_GATED_SECTION_TYPES as readonly string[]).includes(type);
          return (
          <li
            key={type}
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
                <span aria-hidden="true" className="text-[var(--dash-text-muted)]">
                  ⠿
                </span>
                <span aria-hidden="true">{MODULE_ICONS[type]}</span>
                {SECTION_LABELS[type]}
                {isGated && (
                  <button
                    type="button"
                    onClick={() => setExpandedGateInfo((prev) => (prev === type ? null : type))}
                    aria-expanded={expandedGateInfo === type}
                    className="rounded-full bg-[color-mix(in_srgb,var(--dash-accent)_18%,transparent)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--dash-accent)]"
                  >
                    🔒 Basic
                  </button>
                )}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={enabled[type]}
                aria-label={`Turn ${SECTION_LABELS[type]} ${enabled[type] ? "off" : "on"}`}
                disabled={pendingToggle === type}
                onClick={() => handleToggle(type, !enabled[type])}
                className={`relative h-4 w-7 shrink-0 rounded-full transition disabled:opacity-50 ${
                  enabled[type] ? "bg-[var(--dash-accent)]" : "bg-[var(--dash-border)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
                    enabled[type] ? "left-3.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            {isGated && expandedGateInfo === type && (
              <p className="border-t border-[var(--dash-border)] px-3 py-2 text-xs text-[var(--dash-text-muted)]">
                Turn this on and preview it freely — it only shows on your published site once you&apos;re on the Basic plan or above.
              </p>
            )}
          </li>
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
            <span aria-hidden="true">✉️</span>
            Envelope reveal
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={envelopeEnabled}
            aria-label={`Turn envelope reveal ${envelopeEnabled ? "off" : "on"}`}
            disabled={envelopePending}
            onClick={() => handleEnvelopeToggle(!envelopeEnabled)}
            className={`relative h-4 w-7 shrink-0 rounded-full transition disabled:opacity-50 ${
              envelopeEnabled ? "bg-[var(--dash-accent)]" : "bg-[var(--dash-border)]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
                envelopeEnabled ? "left-3.5" : "left-0.5"
              }`}
            />
          </button>
        </div>
        <p className="px-3 pb-1 text-xs text-[var(--dash-text-muted)]">
          A brief animated envelope guests tap open before seeing your site.
        </p>
      </div>
    </div>
  );
}
