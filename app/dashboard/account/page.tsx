import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthedUser } from "@/lib/session";
import AccountForm from "./AccountForm";

export default async function AccountPage() {
  const user = await getAuthedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-900">
          ← Back to dashboard
        </Link>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Account settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the email address you use to log in.
          </p>
          <AccountForm currentEmail={user.email ?? ""} />
        </div>
      </div>
    </div>
  );
}
