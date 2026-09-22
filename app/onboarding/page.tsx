import { Suspense } from "react";
import OnboardingWizard from "./OnboardingWizard";
import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";

/** No auth gate here: `lib/supabase/proxy.ts` gives every visitor reaching
 * this route a real (anonymous, if they had no session at all) Supabase
 * session before this page renders, so the wizard can always persist
 * directly -- no separate logged-out branch needed here. */
export default async function OnboardingPage() {
  // Resolved again here (not threaded from layout.tsx's own props) --
  // layout.tsx only has access to `children`, not a place to hand data to
  // it, and resolveGuestLocale() is a cheap cookie/header read, safe to
  // call once per Server Component that needs it.
  const locale = await resolveGuestLocale();

  return (
    <Suspense fallback={null}>
      <OnboardingWizard locale={locale} />
    </Suspense>
  );
}
