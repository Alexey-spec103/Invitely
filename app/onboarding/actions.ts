"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createEvent } from "@/lib/events";
import { getEventType } from "@/lib/eventTypes";

interface CompleteOnboardingInput {
  eventType: string;
  name1: string;
  name2?: string;
  eventDate: string;
  themeId: string;
  photoUrl?: string;
}

export async function completeOnboarding(input: CompleteOnboardingInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const type = getEventType(input.eventType);
  const names = type.namesMode === "couple" ? [input.name1, input.name2 ?? ""] : [input.name1];
  const title = type.titleTemplate(names);

  await createEvent(user.id, {
    eventType: type.id,
    names,
    title,
    eventDate: input.eventDate,
    themeId: input.themeId,
    photoUrl: input.photoUrl,
  });

  redirect("/dashboard");
}
