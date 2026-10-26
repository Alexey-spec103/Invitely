"use client";

import { useRouter } from "next/navigation";

interface EventSwitcherEvent {
  id: string;
  title: string;
  event_type: string;
  status: string | null;
}

interface EventSwitcherProps {
  events: EventSwitcherEvent[];
  currentEventId: string;
}

// 2026-10-17: "+ New event" moved out to its own NewEventButton, rendered
// as a separate, on-brand pill next to this -- see that file's own comment.
// This select now does exactly one thing (switch between existing events),
// which also means its own options list never needs a special-cased
// sentinel value mixed in with real event ids.
export default function EventSwitcher({ events, currentEventId }: EventSwitcherProps) {
  const router = useRouter();

  const handleChange = (value: string) => {
    router.push(`/dashboard/${value}/site`);
  };

  return (
    <select
      value={currentEventId}
      onChange={(event) => handleChange(event.target.value)}
      className="min-w-0 max-w-[55vw] rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-2 py-1 text-sm font-medium text-[var(--dash-text)] focus:border-[var(--dash-accent)] sm:max-w-none"
      aria-label="Switch event"
    >
      {events.map((event) => (
        <option key={event.id} value={event.id}>
          {event.title} ({event.status === "published" ? "live" : "draft"})
        </option>
      ))}
    </select>
  );
}
