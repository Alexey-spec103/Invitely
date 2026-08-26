"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-stone-50 px-4 text-center">
      <p className="text-5xl">🌱</p>
      <h1 className="text-2xl font-semibold text-stone-900">Something went sideways</h1>
      <p className="max-w-sm text-sm text-stone-500">
        We hit an unexpected error loading your dashboard. Nothing you&apos;ve saved is lost —
        try again, or head back and pick up where you left off.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
