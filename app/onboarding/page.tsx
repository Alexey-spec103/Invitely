import { Suspense } from "react";
import { getAuthedUser } from "@/lib/session";
import OnboardingWizard from "./OnboardingWizard";

/** No auth gate here on purpose: a logged-out visitor can browse the whole
 * wizard (event type, style, names, date) and only hits an account-creation
 * step at the very end -- see OnboardingWizard's `isAuthenticated` prop. An
 * already-authenticated user (starting a second event) skips that step. */
export default async function OnboardingPage() {
  const user = await getAuthedUser();

  return (
    <Suspense fallback={null}>
      <OnboardingWizard isAuthenticated={!!user} />
    </Suspense>
  );
}
