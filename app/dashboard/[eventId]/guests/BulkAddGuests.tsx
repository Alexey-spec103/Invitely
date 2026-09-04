"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addGuestsBulk } from "./actions";
import { parseGuestLines, normalizeGuestName } from "./parseGuestLines";
import type { Tables } from "@/lib/supabase/database.types";

interface BulkAddGuestsProps {
  eventId: string;
  existingGuests: Tables<"guests">[];
}

export default function BulkAddGuests({ eventId, existingGuests }: BulkAddGuestsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedCount, setAddedCount] = useState<number | null>(null);

  const parsed = useMemo(() => parseGuestLines(text), [text]);

  const duplicateNames = useMemo(() => {
    const existingNames = new Set(existingGuests.map((guest) => normalizeGuestName(guest.full_name)));
    return parsed
      .filter((row) => existingNames.has(normalizeGuestName(row.fullName)))
      .map((row) => row.fullName);
  }, [parsed, existingGuests]);

  const handleSubmit = async () => {
    if (
      duplicateNames.length > 0 &&
      !window.confirm(
        `${duplicateNames.length} of these names (${duplicateNames.slice(0, 3).join(", ")}${duplicateNames.length > 3 ? ", ..." : ""}) look like guests you already have. Add them anyway?`
      )
    ) {
      return;
    }
    setError(null);
    setAddedCount(null);
    setSubmitting(true);
    try {
      const count = await addGuestsBulk(eventId, text);
      setAddedCount(count);
      setText("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add guests");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-gray-700 underline hover:text-gray-900"
      >
        {open ? "Hide bulk add" : "Add many guests at once →"}
      </button>

      {open && (
        <div className="mt-3">
          <p className="text-xs text-gray-500">
            Paste one guest per line — from a spreadsheet or typed by hand. Optionally add group,
            email, and phone after a comma or tab: <code>Maria Test, Family, maria@example.com</code>
          </p>
          <textarea
            rows={6}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={"Maria Test\nIvan Petrov, Friends\nOlga Sidorova, Family, olga@example.com"}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />

          {duplicateNames.length > 0 && (
            <p className="mt-2 text-xs text-amber-700">
              {duplicateNames.length} name{duplicateNames.length === 1 ? "" : "s"} look like guests
              you already have: {duplicateNames.slice(0, 3).join(", ")}
              {duplicateNames.length > 3 ? ", ..." : ""}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || parsed.length === 0}
              className="dash-btn dash-btn-primary"
            >
              {submitting
                ? "Adding..."
                : parsed.length > 0
                  ? `Add ${parsed.length} guest${parsed.length === 1 ? "" : "s"}`
                  : "Add guests"}
            </button>
            {addedCount !== null && (
              <span className="text-sm text-green-700">Added {addedCount} guests</span>
            )}
          </div>

          {error && (
            <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
