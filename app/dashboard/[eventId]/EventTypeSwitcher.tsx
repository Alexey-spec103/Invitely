"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronDown } from "lucide-react";
import { getLocalizedEventTypeList } from "@/lib/eventTypesLocalized";
import { EVENT_TYPE_ICON_COMPONENTS } from "@/lib/eventTypeIcons";
import type { Locale } from "@/lib/i18n/locales";
import { changeEventType } from "./actions";

interface EventTypeSwitcherProps {
  eventId: string;
  currentEventType: string;
  name1: string;
  name2?: string;
  locale: Locale;
}

/** Fixes onboarding's one irreversible choice -- event_type was write-once
 * at creation (lib/events.ts's createEvent), with no path to change it
 * afterward anywhere in the dashboard, confirmed by grepping the whole repo.
 * Surfaced in both Site and Style (not just one) since a host who picked
 * wrong might notice from either tab first. Reuses updateWeddingData's own
 * title/subtitle_names/hero-mirror recipe via the new changeEventType
 * action, rather than inventing a second write path. */
export default function EventTypeSwitcher({ eventId, currentEventType, name1, name2, locale }: EventTypeSwitcherProps) {
  const router = useRouter();
  const types = useMemo(() => getLocalizedEventTypeList(locale), [locale]);
  const current = types.find((t) => t.id === currentEventType) ?? types[0];

  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [newName1, setNewName1] = useState(name1);
  const [newName2, setNewName2] = useState(name2 ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pendingType = pendingId ? types.find((t) => t.id === pendingId) : null;
  // Switching within the same namesMode (e.g. Wedding -> Anniversary, both
  // "couple") carries existing names over losslessly -- only a namesMode
  // change needs the host to look at and possibly re-enter names, since
  // e.g. a Wedding's two partner names don't map onto Corporate's single
  // free-text event title on their own.
  const namesModeChanges = pendingType ? pendingType.namesMode !== current.namesMode : false;

  function closeModal() {
    setOpen(false);
    setPendingId(null);
    setError(null);
  }

  function selectType(id: string) {
    if (id === current.id) return;
    setPendingId(id);
    setError(null);
    const type = types.find((t) => t.id === id);
    // Best-effort carryover into the new shape: keep whatever the host
    // already typed as the first field; a mode that needs a second name
    // (single/title -> couple) starts that one blank rather than guessing.
    setNewName1(name1);
    setNewName2(type?.namesMode === "couple" ? (name2 ?? "") : "");
  }

  async function confirmChange() {
    if (!pendingType) return;
    setIsSaving(true);
    setError(null);
    const result = await changeEventType({
      eventId,
      newEventType: pendingType.id,
      name1: newName1.trim(),
      name2: pendingType.namesMode === "couple" ? newName2.trim() : undefined,
    });
    setIsSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    closeModal();
    router.refresh();
  }

  const CurrentIcon = EVENT_TYPE_ICON_COMPONENTS[current.icon];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="dash-btn dash-btn-neutral gap-1.5 px-3.5 py-1.5 text-xs"
      >
        {CurrentIcon && <CurrentIcon className="h-3.5 w-3.5" aria-hidden="true" />}
        {current.label}
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-lg rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="dash-h2 text-base text-[var(--dash-text)]">
                {pendingType ? `Switch to ${pendingType.label}?` : "What are you celebrating?"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
                title="Close"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {!pendingType ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {types.map((type) => {
                  const Icon = EVENT_TYPE_ICON_COMPONENTS[type.icon];
                  const isCurrent = type.id === current.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => selectType(type.id)}
                      disabled={isCurrent}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                        isCurrent
                          ? "cursor-default border-[var(--dash-accent)] bg-[var(--dash-accent)]/10 text-[var(--dash-accent-text)]"
                          : "border-[var(--dash-border)] text-[var(--dash-text)] hover:border-[var(--dash-accent)]"
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
                      <span className="truncate">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[var(--dash-text-muted)]">
                  Your site&apos;s title, prompts, and labels will update to match{" "}
                  <span className="font-medium text-[var(--dash-text)]">{pendingType.label}</span>.
                  {namesModeChanges && " This type asks for names a little differently -- check the field below."}
                </p>

                <div>
                  <label htmlFor="ets-name1" className="block text-sm font-medium text-[var(--dash-text)]">
                    {pendingType.namePrompts[0]}
                  </label>
                  <input
                    id="ets-name1"
                    type="text"
                    value={newName1}
                    onChange={(event) => setNewName1(event.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2 text-sm text-[var(--dash-text)] shadow-sm focus:border-[var(--dash-accent)] focus:outline-none"
                  />
                  {/* This exact field is where the compounding-title bug
                      was first caught live -- carrying over a prior type's
                      full free-text title (e.g. a Corporate Event's name)
                      as-is into a single-mode prompt, then confirming
                      unchanged, produces "X's Birthday's Birthday" on a
                      second switch. Surfacing the real computed title here
                      means it's visible before the write happens, not
                      after. */}
                  {pendingType.namesMode !== "couple" && newName1.trim() && (
                    <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
                      Your site will be titled "{pendingType.titleTemplate([newName1.trim()])}"
                    </p>
                  )}
                </div>

                {pendingType.namesMode === "couple" && (
                  <div>
                    <label htmlFor="ets-name2" className="block text-sm font-medium text-[var(--dash-text)]">
                      {pendingType.namePrompts[1]}
                    </label>
                    <input
                      id="ets-name2"
                      type="text"
                      value={newName2}
                      onChange={(event) => setNewName2(event.target.value)}
                      className="mt-1 w-full rounded-md border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2 text-sm text-[var(--dash-text)] shadow-sm focus:border-[var(--dash-accent)] focus:outline-none"
                    />
                  </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={confirmChange}
                    disabled={isSaving || !newName1.trim()}
                    className="dash-btn dash-btn-primary flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : `Switch to ${pendingType.label}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingId(null)}
                    disabled={isSaving}
                    className="dash-btn dash-btn-neutral"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
