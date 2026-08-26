"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSectionFocus } from "@/components/site/SectionFocusProvider";
import type { SectionType } from "@/components/sections/registry";

export interface ModuleCardStatus {
  label: string;
  tone: "on" | "off" | "neutral";
}

interface ModuleCardProps {
  icon: string;
  title: string;
  status?: ModuleCardStatus;
  defaultOpen?: boolean;
  children: ReactNode;
  /** Registers this card as the target of a click in the live preview (see
   * SectionEditableOverlay) -- when a preview click names this type, the
   * card opens itself and scrolls into view. Omit for the 2 utility cards
   * (Music, Custom domain) that aren't `sections` entries at all. */
  sectionType?: SectionType;
  /** Card-level on/off switch in the header, calling `onToggle` directly
   * (no debounce -- a switch should feel instant). Omit both `enabled` and
   * `onToggle` to keep the header switch-free (Hero has no toggle). */
  enabled?: boolean;
  onToggle?: (enabled: boolean) => Promise<void>;
  /** Whether this module has ever been saved with real content, independent
   * of `enabled` -- drives the "Not set yet" nudge shown only while on. */
  configured?: boolean;
}

const TONE_CLASSES: Record<ModuleCardStatus["tone"], string> = {
  on: "border-emerald-600/40 bg-emerald-50 text-emerald-700",
  off: "border-gray-300 bg-gray-100 text-gray-500",
  neutral: "border-amber-600/40 bg-amber-50 text-amber-700",
};

/** A collapsible card wrapping one module's existing edit form -- title +
 * an on/off switch in the header (for the 10 toggleable modules), fields
 * only mount once opened. Generalizes the inline-toggle pattern first used
 * by WeddingDataCard (Phase 15) so every Site-tab module (Phase 16) can
 * share it instead of always-rendering as one long scrolling form. */
export default function ModuleCard({
  icon,
  title,
  status,
  defaultOpen,
  children,
  sectionType,
  enabled,
  onToggle,
  configured,
}: ModuleCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [checked, setChecked] = useState(enabled ?? false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { activeSection, clearActiveSection } = useSectionFocus();

  // Re-sync the switch's optimistic local state whenever the server-derived
  // `enabled` prop actually changes (e.g. after router.refresh()), without a
  // useEffect -- this is React's documented "adjust state during rendering"
  // pattern for mirroring a prop, not a genuine external-system effect.
  const [prevEnabled, setPrevEnabled] = useState(enabled);
  if (enabled !== prevEnabled) {
    setPrevEnabled(enabled);
    setChecked(enabled ?? false);
  }

  const isFocusTarget = Boolean(sectionType) && activeSection === sectionType;
  if (isFocusTarget && !open) {
    setOpen(true);
  }

  useEffect(() => {
    if (!isFocusTarget) return;
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    clearActiveSection();
  }, [isFocusTarget, clearActiveSection]);

  const handleToggle = async () => {
    if (!onToggle) return;
    const next = !checked;
    setChecked(next);
    setToggleError(null);
    try {
      await onToggle(next);
      router.refresh();
    } catch (err) {
      setChecked(!next);
      setToggleError(err instanceof Error ? err.message : "Couldn't save");
    }
  };

  return (
    <div ref={rootRef} className="rounded-[22px] border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[22px]" aria-hidden="true">
            {icon}
          </span>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {status && (
            <span
              className={`rounded-full border px-3 py-[5px] text-[10px] font-medium leading-none ${TONE_CLASSES[status.tone]}`}
            >
              {status.label}
            </span>
          )}
          {onToggle && checked && configured === false && (
            <span className="rounded-full border border-amber-600/40 bg-amber-50 px-3 py-[5px] text-[10px] font-medium leading-none text-amber-700">
              Not set yet
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {onToggle && (
            <button
              type="button"
              role="switch"
              aria-checked={checked}
              aria-label={`Turn ${title} ${checked ? "off" : "on"}`}
              onClick={handleToggle}
              className={`relative inline-block h-6 w-[46px] shrink-0 rounded-full transition ${
                checked ? "bg-rose-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                  checked ? "left-[26px]" : "left-1"
                }`}
              />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-2xl border border-gray-300 px-[18px] py-[7px] text-[13px] font-semibold text-gray-900 transition hover:bg-gray-50"
          >
            {open ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      {toggleError && <p className="mt-1 text-xs text-red-600">{toggleError}</p>}

      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}
