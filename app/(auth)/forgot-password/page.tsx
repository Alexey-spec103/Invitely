import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default async function ForgotPasswordPage() {
  const locale = await resolveGuestLocale();
  return <ForgotPasswordForm locale={locale} />;
}
