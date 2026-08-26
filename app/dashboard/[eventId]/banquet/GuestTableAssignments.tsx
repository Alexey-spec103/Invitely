"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { assignGuestToTable } from "./banquet-actions";
import type { Tables } from "@/lib/supabase/database.types";

interface GuestTableAssignmentsProps {
  guests: Tables<"guests">[];
  tables: Tables<"banquet_tables">[];
  attendees: Tables<"guest_attendees">[];
  /** guestId -> RSVP `attending` value; a guest with no entry hasn't responded yet. */
  attendingStatusByGuestId: Record<string, boolean | undefined>;
}

export default function GuestTableAssignments({
  guests,
  tables,
  attendees,
  attendingStatusByGuestId,
}: GuestTableAssignmentsProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  // Seating happens after RSVPs are in, to seat only confirmed guests --
  // default this on whenever there's any RSVP data, so bulk-assign doesn't
  // silently seat declined/unresponded guests unless the host opts out.
  const [attendingOnly, setAttendingOnly] = useState(
    () => Object.keys(attendingStatusByGuestId).length > 0
  );
  const [bulkTableId, setBulkTableId] = useState("");
  const [bulkAssigning, setBulkAssigning] = useState(false);

  const handleAssign = async (guestId: string, tableId: string) => {
    setError(null);
    setPendingId(guestId);
    try {
      await assignGuestToTable({ guestId, tableId: tableId || null });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setPendingId(null);
    }
  };

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return guests.filter((guest) => {
      if (unassignedOnly && guest.table_id) return false;
      if (attendingOnly && attendingStatusByGuestId[guest.id] !== true) return false;
      if (!query) return true;
      const partyNames = attendees
        .filter((attendee) => attendee.guest_id === guest.id)
        .map((attendee) => attendee.full_name);
      return [guest.full_name, ...partyNames].some((name) => name.toLowerCase().includes(query));
    });
  }, [guests, attendees, search, unassignedOnly, attendingOnly, attendingStatusByGuestId]);

  const unassignedInView = filteredGuests.filter((guest) => !guest.table_id);

  // A table's real headcount is the seated guest plus their named attendees
  // -- the party, not just the one row that got assigned to a table_id.
  const seatedCountByTable = useMemo(() => {
    const counts = new Map<string, number>();
    for (const guest of guests) {
      if (!guest.table_id) continue;
      const partySize = 1 + attendees.filter((attendee) => attendee.guest_id === guest.id).length;
      counts.set(guest.table_id, (counts.get(guest.table_id) ?? 0) + partySize);
    }
    return counts;
  }, [guests, attendees]);

  const tableLabel = (table: Tables<"banquet_tables">) => {
    const seated = seatedCountByTable.get(table.id) ?? 0;
    return table.capacity != null ? `${table.name} (${seated}/${table.capacity})` : table.name;
  };

  const handleBulkAssign = async () => {
    if (!bulkTableId || unassignedInView.length === 0) return;
    setError(null);
    setBulkAssigning(true);
    try {
      for (const guest of unassignedInView) {
        await assignGuestToTable({ guestId: guest.id, tableId: bulkTableId });
      }
      setBulkTableId("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to bulk-assign");
    } finally {
      setBulkAssigning(false);
    }
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-lg font-semibold text-gray-900">Seat guests</h2>
      <p className="mt-1 text-sm text-gray-500">Assign each guest to a table.</p>

      {tables.some((table) => table.capacity != null && (seatedCountByTable.get(table.id) ?? 0) > table.capacity) && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Over capacity:{" "}
          {tables
            .filter((table) => table.capacity != null && (seatedCountByTable.get(table.id) ?? 0) > table.capacity)
            .map((table) => `${table.name} (${seatedCountByTable.get(table.id)}/${table.capacity})`)
            .join(", ")}
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {guests.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guests..."
              className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <label className="flex items-center gap-1.5 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={unassignedOnly}
                onChange={(event) => setUnassignedOnly(event.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300"
              />
              Unassigned only
            </label>
            {Object.keys(attendingStatusByGuestId).length > 0 && (
              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={attendingOnly}
                  onChange={(event) => setAttendingOnly(event.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300"
                />
                Attending only
              </label>
            )}
            <span className="text-xs text-gray-500">
              {filteredGuests.length} of {guests.length} guest{guests.length === 1 ? "" : "s"}
            </span>
          </div>

          {tables.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={bulkTableId}
                onChange={(event) => setBulkTableId(event.target.value)}
                disabled={bulkAssigning}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Choose a table...</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {tableLabel(table)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBulkAssign}
                disabled={!bulkTableId || unassignedInView.length === 0 || bulkAssigning}
                className="whitespace-nowrap rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bulkAssigning
                  ? "Assigning..."
                  : `Assign all ${unassignedInView.length} unassigned in view`}
              </button>
            </div>
          )}
        </div>
      )}

      <ul className={`divide-y divide-gray-200 border-t border-gray-200 ${guests.length > 0 ? "mt-4" : "mt-6"}`}>
        {guests.length === 0 && (
          <li className="py-4 text-sm text-gray-500">No guests added yet.</li>
        )}
        {guests.length > 0 && filteredGuests.length === 0 && (
          <li className="py-4 text-sm text-gray-500">No guests match your search/filter.</li>
        )}
        {filteredGuests.map((guest) => {
          const partyAttendees = attendees.filter((attendee) => attendee.guest_id === guest.id);
          return (
          <li key={guest.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">{guest.full_name}</p>
                {(() => {
                  const status = attendingStatusByGuestId[guest.id];
                  if (status === true) {
                    return (
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                        Attending
                      </span>
                    );
                  }
                  if (status === false) {
                    return (
                      <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                        Not attending
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
              {partyAttendees.length > 0 && (
                <p className="text-xs text-gray-500">
                  + {partyAttendees.map((attendee) => attendee.full_name).join(", ")}
                </p>
              )}
            </div>
            <select
              value={guest.table_id ?? ""}
              disabled={pendingId === guest.id}
              onChange={(event) => handleAssign(guest.id, event.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">— unassigned —</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name}
                </option>
              ))}
            </select>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
