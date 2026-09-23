"use client";

import type { TimelineEvent } from "@/components/sections/TimelineSection";

interface TimelineEventsManagerProps {
  events: TimelineEvent[];
  onChange: (events: TimelineEvent[]) => void;
}

/** Same "boxed settings panel below the live section, controlled props,
 * labeled rows + a clear Remove per row + one big Add at the bottom" shape
 * as DressCodeColorsManager/RsvpQuestionsManager -- Timeline previously had
 * no equivalent, only a bare `+ Add event` pill under the live canvas and a
 * per-event delete buried in the floating inline toolbar (only reachable
 * after selecting one of that event's fields first). Confirmed live
 * complaint: the add button "вообще не видно сразу" (not visible at all
 * right away).
 *
 * `time` stays a plain labeled text input, not a native `<input
 * type="time">` -- every TimelineSection variant already renders `time` as
 * freeform display text (e.g. "Ceremony begins", not just "14:00"), and a
 * strict HH:MM picker would fight that flexibility. */
export default function TimelineEventsManager({ events, onChange }: TimelineEventsManagerProps) {
  const updateEvent = (index: number, patch: Partial<TimelineEvent>) => {
    onChange(events.map((event, i) => (i === index ? { ...event, ...patch } : event)));
  };

  return (
    <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-text-muted)]">Schedule</p>
      <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
        Add each moment of the day here -- time, name, and an optional detail line.
      </p>
      <div className="mt-3 space-y-3">
        {events.map((event, index) => (
          <div key={index} className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-2)] p-2.5">
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-xs text-[var(--dash-text-muted)]">
                Time
                <input
                  type="text"
                  value={event.time}
                  onChange={(e) => updateEvent(index, { time: e.target.value })}
                  placeholder="e.g. 14:00 or 2:00 PM"
                  className="w-32 rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-1 text-sm text-[var(--dash-text)]"
                />
              </label>
              <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs text-[var(--dash-text-muted)]">
                Event
                <input
                  type="text"
                  value={event.title}
                  onChange={(e) => updateEvent(index, { title: e.target.value })}
                  placeholder="e.g. Ceremony"
                  className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-1 text-sm text-[var(--dash-text)]"
                />
              </label>
              <button
                type="button"
                onClick={() => onChange(events.filter((_, i) => i !== index))}
                className="dash-btn dash-btn-neutral text-xs"
              >
                Remove
              </button>
            </div>
            <label className="mt-2 flex flex-col gap-1 text-xs text-[var(--dash-text-muted)]">
              Details (optional)
              <input
                type="text"
                value={event.description ?? ""}
                onChange={(e) => updateEvent(index, { description: e.target.value })}
                placeholder="e.g. Cocktails on the terrace to follow"
                className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-1 text-sm text-[var(--dash-text)]"
              />
            </label>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <button
          type="button"
          onClick={() => onChange([...events, { time: "", title: "New event", description: "" }])}
          className="dash-btn dash-btn-primary"
        >
          + Add event
        </button>
      </div>
    </div>
  );
}
