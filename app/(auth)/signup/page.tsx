import { Suspense } from "react";
import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  const locale = await resolveGuestLocale();
  return (
    <Suspense fallback={null}>
      <SignupForm locale={locale} />
    </Suspense>
  );
}
