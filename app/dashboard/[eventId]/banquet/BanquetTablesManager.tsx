"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addBanquetTable, renameBanquetTable, deleteBanquetTable, updateBanquetTableCapacity } from "./banquet-actions";
import type { Tables } from "@/lib/supabase/database.types";

const tableFormSchema = z.object({
  name: z.string().min(1, "Enter a table name"),
  capacity: z.string(),
});

type TableFormValues = z.infer<typeof tableFormSchema>;

interface BanquetTablesManagerProps {
  eventId: string;
  tables: Tables<"banquet_tables">[];
  label: string;
}

export default function BanquetTablesManager({ eventId, tables, label }: BanquetTablesManagerProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCapacity, setEditingCapacity] = useState("");
  const [renaming, setRenaming] = useState(false);

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
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const startEditing = (table: Tables<"banquet_tables">) => {
    setEditingId(table.id);
    setEditingName(table.name);
    setEditingCapacity(table.capacity != null ? String(table.capacity) : "");
  };

  const handleRename = async (tableId: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    setRenaming(true);
    try {
      await renameBanquetTable(tableId, trimmed);
      await updateBanquetTableCapacity(tableId, editingCapacity ? Number(editingCapacity) : null);
      router.refresh();
      setEditingId(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to rename");
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async (tableId: string) => {
    if (!window.confirm("Remove this table? Any assigned guests will become unassigned.")) {
      return;
    }
    setDeletingId(tableId);
    try {
      await deleteBanquetTable(tableId);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="dash-h1 text-gray-900">{label}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Set up tables, then assign guests to seats below.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex items-end gap-3" noValidate>
        <div className="flex-1">
          <label htmlFor="tableName" className="block text-sm font-semibold text-gray-900">
            Table name
          </label>
          <input id="tableName" type="text" placeholder="Table 1" className="dash-input mt-1" {...register("name")} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div className="w-24">
          <label htmlFor="tableCapacity" className="block text-sm font-semibold text-gray-900">
            Seats <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input id="tableCapacity" type="number" min={1} placeholder="8" className="dash-input mt-1" {...register("capacity")} />
        </div>
        <button type="submit" disabled={isSubmitting} className="dash-btn dash-btn-primary">
          {isSubmitting ? "Adding..." : "Add table"}
        </button>
      </form>

      {formError && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}

      <ul className="mt-6 divide-y divide-gray-200 border-t border-gray-200">
        {tables.length === 0 && (
          <li className="py-4 text-sm text-gray-500">No tables added yet.</li>
        )}
        {tables.map((table) => (
          <li key={table.id} className="flex items-center justify-between py-3">
            {editingId === table.id ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleRename(table.id);
                    }
                  }}
                  autoFocus
                  className="dash-input max-w-xs"
                />
                <input
                  type="number"
                  min={1}
                  placeholder="Seats"
                  value={editingCapacity}
                  onChange={(event) => setEditingCapacity(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleRename(table.id);
                    }
                  }}
                  className="dash-input w-20"
                />
                <button
                  type="button"
                  onClick={() => handleRename(table.id)}
                  disabled={renaming || !editingName.trim()}
                  className="whitespace-nowrap text-sm font-medium text-gray-900 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {renaming ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="whitespace-nowrap text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-900">
                  {table.name}
                  {table.capacity != null && (
                    <span className="ml-2 text-xs font-normal text-gray-500">{table.capacity} seats</span>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => startEditing(table)}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(table.id)}
                    disabled={deletingId === table.id}
                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === table.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
