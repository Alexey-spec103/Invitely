"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addBanquetTable(eventId: string, name: string, capacity?: number) {
  const supabase = await createClient();

  const { error } = await supabase.from("banquet_tables").insert({
    event_id: eventId,
    name,
    capacity: capacity ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${eventId}/banquet`);
}

export async function updateBanquetTableCapacity(tableId: string, capacity: number | null) {
  const supabase = await createClient();

  const { error } = await supabase.from("banquet_tables").update({ capacity }).eq("id", tableId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

export async function renameBanquetTable(tableId: string, name: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("banquet_tables").update({ name }).eq("id", tableId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

export async function deleteBanquetTable(tableId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("banquet_tables").delete().eq("id", tableId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

interface AssignGuestToTableInput {
  guestId: string;
  tableId: string | null;
}

export async function assignGuestToTable(input: AssignGuestToTableInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("guests")
    .update({ table_id: input.tableId })
    .eq("id", input.guestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}
