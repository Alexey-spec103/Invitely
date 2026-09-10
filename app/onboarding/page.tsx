import { Suspense } from "react";
import OnboardingWizard from "./OnboardingWizard";

/** No auth gate here: `lib/supabase/proxy.ts` gives every visitor reaching
 * this route a real (anonymous, if they had no session at all) Supabase
 * session before this page renders, so the wizard can always persist
 * directly -- no separate logged-out branch needed here. */
export default async function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingWizard />
    </Suspense>
  );
}
