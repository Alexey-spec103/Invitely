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

const NEW_EVENT_VALUE = "__new__";

export default function EventSwitcher({ events, currentEventId }: EventSwitcherProps) {
  const router = useRouter();

  const handleChange = (value: string) => {
    if (value === NEW_EVENT_VALUE) {
      router.push("/onboarding");
      return;
    }
    router.push(`/dashboard/${value}/site`);
  };

  return (
    <select
      value={currentEventId}
      onChange={(event) => handleChange(event.target.value)}
      className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-2 py-1 text-sm font-medium text-[var(--dash-text)] focus:border-[var(--dash-accent)] focus:outline-none"
      aria-label="Switch event"
    >
      {events.map((event) => (
        <option key={event.id} value={event.id}>
          {event.title} ({event.status === "published" ? "live" : "draft"})
        </option>
      ))}
      <option value={NEW_EVENT_VALUE}>+ New event</option>
    </select>
  );
}
