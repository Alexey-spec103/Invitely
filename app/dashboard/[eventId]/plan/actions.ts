"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { plans } from "@/lib/plans";

interface UpdatePlanInput {
  eventId: string;
  planId: string;
}

export async function updatePlan(input: UpdatePlanInput) {
  if (!plans[input.planId]) {
    throw new Error("Unknown plan");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({ plan_id: input.planId })
    .eq("id", input.eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/plan`);
}
