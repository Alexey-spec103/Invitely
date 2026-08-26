import Link from "next/link";

export default function EventNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl">🔍</p>
      <h1 className="text-2xl font-semibold text-stone-900">We couldn&apos;t find this invitation</h1>
      <p className="max-w-sm text-sm text-stone-500">
        The link might be mistyped, or the host hasn&apos;t published their site yet. Worth a
        quick text to double-check the link — in the meantime, feel free to look around.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
      >
        Go to Invitely
      </Link>
    </div>
  );
}
