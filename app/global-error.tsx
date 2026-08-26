"use client";

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center font-sans">
        <h1 className="text-2xl font-semibold text-stone-900">Something went wrong</h1>
        <p className="max-w-sm text-sm text-stone-500">
          Invitely hit an unexpected error. Please try again.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-2 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
