import Link from "next/link";
import InvitelyLogo from "@/components/InvitelyLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-xl font-semibold tracking-tight text-stone-900"
        >
          <InvitelyLogo className="h-7 w-7" />
          Invimbo
        </Link>
        {children}
      </div>
    </div>
  );
}
