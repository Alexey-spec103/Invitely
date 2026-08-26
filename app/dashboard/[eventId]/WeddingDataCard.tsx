"use client";

import { useState } from "react";
import WeddingDataForm from "./WeddingDataForm";

interface WeddingDataCardProps {
  eventId: string;
  eventType: string;
  percent: number;
  defaultValues: {
    name1: string;
    name2: string;
    eventDate: string;
    venueName: string;
    venueCity: string;
    venueAddress: string;
  };
}

/** Hub-screen card for the unified wedding-data source -- shows the
 * completion % at a glance, and toggles the edit form open inline rather
 * than routing to a separate page/modal. */
export default function WeddingDataCard({ eventId, eventType, percent, defaultValues }: WeddingDataCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Wedding data</p>
          <p className="mt-1 text-xs text-gray-500">Names, date & venue — used across your site and paper set.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-900 transition hover:bg-gray-50"
        >
          {open ? "Close" : "Change"}
        </button>
      </div>

      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-rose-600 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-1 text-xs font-medium text-gray-600">Filled in {percent}%</p>
      </div>

      {open && <WeddingDataForm eventId={eventId} eventType={eventType} defaultValues={defaultValues} />}
    </div>
  );
}
