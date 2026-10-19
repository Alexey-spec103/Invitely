import type { Metadata } from "next";
import Link from "next/link";
import InvitelyLogo from "@/components/InvitelyLogo";

// Technical SEO audit (2026-10-17): none of the 4 pages under this route
// group set their own metadata (2 are Client Components -- forgot-password/
// reset-password -- where Next.js doesn't allow a `metadata` export at all,
// so this shared Server Component layout is the one place that reaches all
// of them). Without this, every one of them inherited the root layout's
// title/description verbatim -- a crawler would see 4 extra pages all
// titled "Invimbo - event websites, live in minutes" with zero unique
// content (login/signup forms, password reset), a textbook duplicate-title
// signal that dilutes the homepage's own relevance for that exact title/
// query match. noindex is the correct fix, not a better title: these pages
// have no standalone search intent worth ranking for (nobody searches
// "Invimbo login"), and account pages generally shouldn't be indexed
// regardless. `follow: true` so link equity (e.g. the logo link back to
// "/") still passes through rather than being wasted.
export const metadata: Metadata = {
  title: "Sign in or create an account",
  robots: { index: false, follow: true },
};

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
