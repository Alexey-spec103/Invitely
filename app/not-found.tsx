import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-stone-50 px-4 text-center">
      <p className="text-5xl">💐</p>
      <h1 className="text-2xl font-semibold text-stone-900">This page wandered off somewhere</h1>
      <p className="max-w-sm text-sm text-stone-500">
        We couldn&apos;t find what you&apos;re looking for — but that&apos;s no reason to call off
        the celebration. Let&apos;s get you back on track.
      </p>
      <div className="mt-2 flex gap-3">
        <Link
          href="/"
          className="rounded-full border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
        >
          Go to Invitely
        </Link>
        <Link
          href="/#themes"
          className="rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Browse styles
        </Link>
      </div>
    </div>
  );
}
