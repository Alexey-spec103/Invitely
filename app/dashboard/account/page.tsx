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
    // impeccable critique (minor observation): the page-level <h1> used to
    // live INSIDE the narrow white card instead of above it -- every other
    // cabinet page (Guests, Site, Paper...) puts its heading + subtitle
    // directly in the page flow first, then content cards below. Matching
    // that here is what actually fixed the "this page feels unfinished"
    // read; the content itself (one email field + danger zone) was never
    // the problem.
    // dashboard critique (Site/Plan/Account round 1): `max-w-sm` (384px) left
    // the whole page pinned to the far left of the viewport with a huge dead
    // gray area to its right -- confirmed live at 1288px width. Every other
    // cabinet page's content fills (or nearly fills) `main`'s own width
    // rather than imposing its own tight cap; widened to match without
    // letting a single-column email form stretch uncomfortably wide.
    <div className="max-w-2xl">
      <h1 className="dash-h1 text-gray-900">Account settings</h1>
      <p className="mt-1 text-sm text-gray-500">Manage the email address you use to log in.</p>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <AccountForm currentEmail={user.email ?? ""} />
      </div>
      <DeleteAccountSection currentEmail={user.email ?? ""} />
    </div>
  );
}
