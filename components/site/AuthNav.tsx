import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AuthNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="fixed top-4 right-4 z-50">
      <Link
        href={user ? "/dashboard" : "/login"}
        className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-900 shadow-sm backdrop-blur transition hover:bg-white"
      >
        {user ? "Dashboard" : "Login"}
      </Link>
    </div>
  );
}
