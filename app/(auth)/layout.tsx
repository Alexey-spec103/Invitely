import Link from "next/link";
import InvitelyLogo from "@/components/InvitelyLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-1.5 text-lg font-semibold tracking-tight text-stone-900"
        >
          <InvitelyLogo className="h-5 w-5" />
          Invitely
        </Link>
        {children}
      </div>
    </div>
  );
}
