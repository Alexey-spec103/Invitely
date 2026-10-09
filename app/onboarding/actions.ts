"use server";

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

export async function completeOnboarding(
  input: CompleteOnboardingInput
): Promise<{ ok: true; eventId: string } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const type = getEventType(input.eventType);
  const names = type.namesMode === "couple" ? [input.name1, input.name2 ?? ""] : [input.name1];
  const title = type.titleTemplate(names);

  let event;
  try {
    event = await createEvent(user.id, {
      eventType: type.id,
      names,
      title,
      eventDate: input.eventDate,
      themeId: input.themeId,
      photoUrl: input.photoUrl,
    });
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Failed to save" };
  }

  // Not redirect() here -- it throws a special NEXT_REDIRECT signal that the
  // caller's own try/catch (needed to surface a real failure as form error
  // text) would otherwise swallow and show verbatim as "NEXT_REDIRECT" to
  // every single new user. The client navigates on router.push after
  // checking `ok`, same as every other action in this codebase that
  // reports success/failure via a plain return value.
  //
  // eventId returned (not just `ok: true`) so the client can push straight
  // to this event's own Site tab instead of the generic /dashboard, which
  // itself just redirects to events[0]'s Site tab -- skips that extra hop
  // and lets the client mark the visit as a first-visit (see
  // OnboardingWizard.tsx's onSubmit and the Site page's own firstVisit
  // handling) so the finished site can be shown before the settings/upsell
  // cards, right after step 3's own live-preview payoff.
  return { ok: true, eventId: event.id };
}
