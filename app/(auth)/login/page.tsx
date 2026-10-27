import { Suspense } from "react";
import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const locale = await resolveGuestLocale();
  return (
    <Suspense fallback={null}>
      <LoginForm locale={locale} />
    </Suspense>
  );
}
