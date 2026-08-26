"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function EventError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl">🫠</p>
      <h1 className="text-2xl font-semibold text-stone-900">Well, that didn&apos;t go as planned</h1>
      <p className="max-w-sm text-sm text-stone-500">
        This invitation hit a snag loading — not you, us. Give it another try, or check back with
        the host if it keeps happening.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
        >
          Go to Invitely
        </Link>
      </div>
    </div>
  );
}
