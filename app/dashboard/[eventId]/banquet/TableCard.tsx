"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Users } from "lucide-react";
import { renameBanquetTable, updateBanquetTableCapacity, deleteBanquetTable, assignGuestToTable } from "./banquet-actions";
import type { Tables } from "@/lib/supabase/database.types";

export interface SeatedGuest {
  id: string;
  fullName: string;
  partyNames: string[];
}

interface TableCardProps {
  table: Tables<"banquet_tables">;
  seatedGuests: SeatedGuest[];
  unassignedGuests: Tables<"guests">[];
}

/** dashboard-audit.md B16: weddingpost.ru's own "Карточка стола" -- the
 * table's actual guest list + an inline "add guest", replacing what used to
 * be a bare name/capacity form row.
 *
 * Direct feedback: this used to also show a live preview of the printable
 * table-number/table card (watermarked below Premium) -- confusing once
 * this component moved from the Banquet tab (paper) to the Site tab
 * (digital, free on any plan): a paid-feature watermark had no business
 * showing up in a free planning tool. The actual paper preview still lives
 * on Paper (PaperConstructor already renders the real thing independently)
 * -- this is now just the seating-assignment management itself. */
export default function TableCard({ table, seatedGuests, unassignedGuests }: TableCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(table.name);
  const [capacity, setCapacity] = useState(table.capacity != null ? String(table.capacity) : "");
  const [savingEdit, setSavingEdit] = useState(false);
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allGuestNames = seatedGuests.flatMap((guest) => [guest.fullName, ...guest.partyNames]);
  const seatedCount = allGuestNames.length;

  const handleSaveEdit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSavingEdit(true);
    setError(null);
    try {
      await renameBanquetTable(table.id, trimmed);
      await updateBanquetTableCapacity(table.id, capacity ? Number(capacity) : null);
      router.refresh();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove this table? Any assigned guests will become unassigned.")) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteBanquetTable(table.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  };

  const handleAddGuest = async () => {
    if (!selectedGuestId) return;
    setAssigning(true);
    setError(null);
    try {
      await assignGuestToTable({ guestId: selectedGuestId, tableId: table.id });
      setSelectedGuestId("");
      setIsAddingGuest(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add guest");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          {isEditing ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
                className="dash-input max-w-[10rem]"
              />
              <input
                type="number"
                min={1}
                placeholder="Seats"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                className="dash-input w-20"
              />
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit || !name.trim()}
                className="whitespace-nowrap text-sm font-medium text-gray-900 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingEdit ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(table.name);
                  setCapacity(table.capacity != null ? String(table.capacity) : "");
                }}
                className="whitespace-nowrap text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)} className="text-left">
              <p className="text-sm font-semibold text-gray-900">
                {table.name}
                {table.capacity != null && (
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    {seatedCount}/{table.capacity} seats
                  </span>
                )}
              </p>
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Remove table"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3">
          {seatedGuests.length === 0 ? (
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <Users className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p>No guests yet</p>
                <p className="text-xs text-gray-400">Add guests to fill this table.</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-1 text-sm text-gray-700">
              {seatedGuests.map((guest) => (
                <li key={guest.id}>
                  {guest.fullName}
                  {guest.partyNames.length > 0 && (
                    <span className="text-gray-400"> +{guest.partyNames.length}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-3">
          {isAddingGuest ? (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedGuestId}
                onChange={(event) => setSelectedGuestId(event.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">Choose a guest...</option>
                {unassignedGuests.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.full_name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddGuest}
                disabled={!selectedGuestId || assigning}
                className="dash-btn dash-btn-neutral px-2 py-1 text-xs"
              >
                {assigning ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingGuest(false)}
                className="text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingGuest(true)}
              disabled={unassignedGuests.length === 0}
              title={unassignedGuests.length === 0 ? "Every guest is already seated" : undefined}
              className="dash-btn dash-btn-neutral gap-1 px-3 py-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add guest
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
