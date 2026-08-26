import type { Tables } from "@/lib/supabase/database.types";

export interface RsvpQuestionLabel {
  id: string;
  label: string;
}

/** Shared by the client-side RsvpResponses list and the server-rendered
 * guest-list PDF export, so custom RSVP question answers (meal choice,
 * transport, etc.) are formatted identically in both places. */
export function formatAnswers(
  mealPreferences: Tables<"rsvp_responses">["meal_preferences"],
  questions: RsvpQuestionLabel[]
): { label: string; answer: string }[] {
  if (!mealPreferences || typeof mealPreferences !== "object" || Array.isArray(mealPreferences)) {
    return [];
  }
  return Object.entries(mealPreferences)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim().length > 0)
    .map(([questionId, answer]) => ({
      label: questions.find((question) => question.id === questionId)?.label ?? "Answer",
      answer,
    }));
}
