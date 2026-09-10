"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRealUser } from "@/lib/session";
import { plans } from "@/lib/plans";

interface UpdatePlanInput {
  eventId: string;
  planId: string;
}

export async function updatePlan(input: UpdatePlanInput) {
  if (!plans[input.planId]) {
    throw new Error("Unknown plan");
  }

  // Plan/billing changes require a real account, not just any session -- an
  // anonymous trial user can build and preview freely on the Free plan, but
  // can't move to a paid tier until they have a real (non-anonymous) account.
  const user = await requireRealUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({ plan_id: input.planId })
    .eq("id", input.eventId)
    .eq("owner_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/plan`);
}
