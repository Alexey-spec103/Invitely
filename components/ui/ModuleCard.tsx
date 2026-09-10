"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface ModuleCardStatus {
  label: string;
  tone: "on" | "off" | "neutral";
}

interface ModuleCardProps {
  id?: string;
  icon: string;
  title: string;
  status?: ModuleCardStatus;
  defaultOpen?: boolean;
  children: ReactNode;
  /** A real content thumbnail (e.g. Hero/Letter/Video's uploaded photo) --
   * shown instead of the icon tile when present, so cards with real content
   * carry a genuine preview rather than a generic glyph. */
  previewImageUrl?: string;
  /** Card-level on/off switch in the header, calling `onToggle` directly
   * (no debounce -- a switch should feel instant). Omit both `enabled` and
   * `onToggle` to keep the header switch-free (Hero has no toggle). */
  enabled?: boolean;
  onToggle?: (enabled: boolean) => Promise<void>;
  /** Whether this module has ever been saved with real content, independent
   * of `enabled` -- drives the "Not set yet" nudge shown only while on. */
  configured?: boolean;
  /** Visually promotes this one card above the rest of an otherwise-uniform
   * stack -- bigger icon tile, serif title, coral left-border accent. Meant
   * for exactly one card per stack (Wedding data on the Site tab): the
   * thing every other module actually depends on, not just another item in
   * the list. */
  emphasized?: boolean;
}

const TONE_CLASSES: Record<ModuleCardStatus["tone"], string> = {
  on: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  off: "border-white/10 bg-white/5 text-[var(--dash-text-muted)]",
  neutral: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

/** A collapsible card wrapping one module's existing edit form -- title +
 * an on/off switch in the header (for the 10 toggleable modules), fields
 * only mount once opened. Generalizes the inline-toggle pattern first used
 * by WeddingDataCard (Phase 15) so every Site-tab module (Phase 16) can
 * share it instead of always-rendering as one long scrolling form. */
export default function ModuleCard({
  id,
  icon,
  title,
  status,
  defaultOpen,
  children,
  previewImageUrl,
  enabled,
  onToggle,
  configured,
  emphasized,
}: ModuleCardProps) {
  const router = useRouter();
  // dashboard-audit.md B13: weddingpost.ru's own wedding-data fields (Venue/
  // City/Address) sit directly in the panel, always visible -- confirmed
  // live, no click-to-reveal at all, unlike our own "collapsed once
  // complete, click Edit to see the fields again" behavior. `emphasized` is
  // only ever used for that one card (see this component's own doc comment
  // above), so forcing it permanently open here -- no Edit/Close toggle --
  // is a targeted fix, not a behavior change for any other module.
  const [open, setOpen] = useState(emphasized ? true : (defaultOpen ?? false));
  const [checked, setChecked] = useState(enabled ?? false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  // Re-sync the switch's optimistic local state whenever the server-derived
  // `enabled` prop actually changes (e.g. after router.refresh()), without a
  // useEffect -- this is React's documented "adjust state during rendering"
  // pattern for mirroring a prop, not a genuine external-system effect.
  const [prevEnabled, setPrevEnabled] = useState(enabled);
  if (enabled !== prevEnabled) {
    setPrevEnabled(enabled);
    setChecked(enabled ?? false);
  }

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
    <div
      id={id}
      className={
        emphasized
          ? "scroll-mt-6 rounded-[22px] border border-[var(--dash-border)] border-l-4 border-l-[var(--dash-accent)] bg-[var(--dash-surface)] p-6"
          : "scroll-mt-6 rounded-[22px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5"
      }
    >
      <div
        className={
          emphasized
            ? "flex flex-wrap items-center justify-between gap-3"
            : "flex items-center justify-between gap-3"
        }
      >
        <div className={emphasized ? "flex min-w-0 flex-1 items-center gap-3" : "flex min-w-0 items-center gap-3"}>
          {previewImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- small dashboard thumbnail, not a public-site asset worth next/image's pipeline
            <img
              src={previewImageUrl}
              alt=""
              className={
                emphasized
                  ? "h-12 w-12 shrink-0 rounded-lg border border-[var(--dash-border)] object-cover"
                  : "h-9 w-9 shrink-0 rounded-lg border border-[var(--dash-border)] object-cover"
              }
            />
          ) : (
            <span
              className={
                emphasized
                  ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-accent)]/12 text-[22px]"
                  : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-accent)]/12 text-[17px]"
              }
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <p
            className={
              emphasized
                ? "min-w-0 font-[family-name:var(--dash-font-heading)] text-xl font-semibold text-[var(--dash-text)]"
                : "truncate text-sm font-semibold text-[var(--dash-text)]"
            }
          >
            {title}
          </p>
          {!emphasized && status && (
            <span
              className={`shrink-0 rounded-full border px-3 py-[5px] text-[10px] font-medium leading-none ${TONE_CLASSES[status.tone]}`}
            >
              {status.label}
            </span>
          )}
          {!emphasized && onToggle && checked && configured === false && (
            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-[5px] text-[10px] font-medium leading-none text-amber-400">
              Not set yet
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {emphasized && status && (
            <span
              className={`shrink-0 rounded-full border px-3 py-[5px] text-[10px] font-medium leading-none ${TONE_CLASSES[status.tone]}`}
            >
              {status.label}
            </span>
          )}
          {emphasized && onToggle && checked && configured === false && (
            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-[5px] text-[10px] font-medium leading-none text-amber-400">
              Not set yet
            </span>
          )}
          {onToggle && (
            <button
              type="button"
              role="switch"
              aria-checked={checked}
              aria-label={`Turn ${title} ${checked ? "off" : "on"}`}
              onClick={handleToggle}
              className={`relative inline-block h-6 w-[46px] shrink-0 rounded-full transition ${
                checked ? "bg-[var(--dash-accent)]" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                  checked ? "left-[26px]" : "left-1"
                }`}
              />
            </button>
          )}
          {!emphasized && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-2xl border border-[var(--dash-border)] px-[18px] py-[7px] text-[13px] font-semibold text-[var(--dash-text)] transition hover:border-[var(--dash-accent)]"
            >
              {open ? "Close" : "Edit"}
            </button>
          )}
        </div>
      </div>

      {toggleError && <p className="mt-1 text-xs text-red-400">{toggleError}</p>}

      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}
