"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { addBanquetTable } from "./banquet-actions";
import TableCard, { type SeatedGuest } from "./TableCard";
import type { Theme } from "@/lib/themes";
import type { Tables } from "@/lib/supabase/database.types";

const tableFormSchema = z.object({
  name: z.string().min(1, "Enter a table name"),
  capacity: z.string(),
});

type TableFormValues = z.infer<typeof tableFormSchema>;

interface BanquetTablesManagerProps {
  eventId: string;
  theme: Theme;
  tables: Tables<"banquet_tables">[];
  guests: Tables<"guests">[];
  attendees: Tables<"guest_attendees">[];
  /** dashboard-audit.md B21: true when the event's plan is below Premium. */
  locked: boolean;
}

/** dashboard-audit.md B16: replaces the old bare add-table form + plain
 * name-only list with a grid of real table cards (see TableCard.tsx),
 * plus a dashed "add table" card matching weddingpost.ru's own layout --
 * confirmed live, a card grid with a dashed placeholder card trailing it,
 * not a static form pinned above the list. */
export default function BanquetTablesManager({
  eventId,
  theme,
  tables,
  guests,
  attendees,
  locked,
}: BanquetTablesManagerProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TableFormValues>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: { name: "", capacity: "" },
  });

  const onSubmit = async (values: TableFormValues) => {
    setFormError(null);
    try {
      await addBanquetTable(eventId, values.name, values.capacity ? Number(values.capacity) : undefined);
      reset();
      setIsAdding(false);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const unassignedGuests = guests.filter((guest) => !guest.table_id);

  const seatedGuestsByTable = (tableId: string): SeatedGuest[] =>
    guests
      .filter((guest) => guest.table_id === tableId)
      .map((guest) => ({
        id: guest.id,
        fullName: guest.full_name,
        partyNames: attendees
          .filter((attendee) => attendee.guest_id === guest.id)
          .map((attendee) => attendee.full_name),
      }));

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            eventId={eventId}
            theme={theme}
            table={table}
            seatedGuests={seatedGuestsByTable(table.id)}
            unassignedGuests={unassignedGuests}
            locked={locked}
          />
        ))}

        {isAdding ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 p-5"
            noValidate
          >
            <div>
              <label htmlFor="tableName" className="block text-xs font-semibold text-gray-900">
                Table name
              </label>
              <input id="tableName" type="text" placeholder="Table 1" className="dash-input mt-1" autoFocus {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="tableCapacity" className="block text-xs font-semibold text-gray-900">
                Seats <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input id="tableCapacity" type="number" min={1} placeholder="8" className="dash-input mt-1" {...register("capacity")} />
            </div>
            {formError && <p className="text-xs text-red-600">{formError}</p>}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={isSubmitting} className="dash-btn dash-btn-primary text-sm">
                {isSubmitting ? "Adding..." : "Add table"}
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setFormError(null);
                  setIsAdding(false);
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 p-5 text-gray-500 transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
              <Plus className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">Add table</span>
          </button>
        )}
      </div>
    </div>
  );
}
