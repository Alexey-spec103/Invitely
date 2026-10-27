import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";
import ResetPasswordForm from "./ResetPasswordForm";

export default async function ResetPasswordPage() {
  const locale = await resolveGuestLocale();
  return <ResetPasswordForm locale={locale} />;
}
