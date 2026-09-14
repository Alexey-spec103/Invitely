import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import AccountForm from "./AccountForm";
import DeleteAccountSection from "./DeleteAccountSection";

export default async function AccountPage() {
  const user = await getAuthedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-sm">
      <div className="rounded-xl border border-gray-200 border-l-4 border-l-[var(--dash-accent)] bg-white p-8 shadow-sm">
        <h1 className="dash-h1 text-gray-900">Account settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage the email address you use to log in.</p>
        <AccountForm currentEmail={user.email ?? ""} />
      </div>
      <DeleteAccountSection currentEmail={user.email ?? ""} />
    </div>
  );
}
