"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRsvpEmailNotifications } from "./actions";

interface RsvpNotificationToggleProps {
  eventId: string;
  enabled: boolean;
}

/** Direct feedback: "клиент настроил как он хочет получать обновления" --
 * a host previously had no choice at all (submitRsvp emails the owner on
 * every response, unconditionally, once the RPC migration is applied).
 * Some hosts want that; others would rather just check the RSVP list above
 * whenever they feel like it. Plain native checkbox, not SectionToggleSwitch
 * -- that component reads --dash-* custom properties meant for the dark
 * constructor theme (Site/Paper); this page has always used plain Tailwind
 * grays, matching every other control already on it (e.g. GuestTableAssignments'
 * own "Unassigned only" filter checkbox). */
export default function RsvpNotificationToggle({ eventId, enabled }: RsvpNotificationToggleProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(enabled);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (next: boolean) => {
    setChecked(next);
    setError(null);
    setPending(true);
    try {
      const result = await updateRsvpEmailNotifications(eventId, next);
      if (!result.ok) throw new Error(result.message);
      router.refresh();
    } catch (err) {
      setChecked(!next);
      setError(err instanceof Error ? err.message : "Couldn't save");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5">
      <div>
        <p className="text-sm font-semibold text-gray-900">📧 Email me new RSVP responses</p>
        <p className="mt-0.5 text-xs text-gray-500">
          Get an email the moment a guest responds. You can always check every response above, whether this is on or
          off.
        </p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <label className="mt-0.5 flex shrink-0 cursor-pointer items-center gap-2 text-xs text-gray-500">
        <input
          type="checkbox"
          checked={checked}
          disabled={pending}
          onChange={(event) => handleChange(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
      </label>
    </div>
  );
}
