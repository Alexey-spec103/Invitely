"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unlockSitePassword } from "./actions";

interface SitePasswordGateProps {
  eventId: string;
  title: string;
}

/** Shown instead of the real site while a password-protected event's guest
 * hasn't unlocked it yet (page.tsx's own gate check). Deliberately plain/
 * neutral styling, not theme-aware -- matches this route's own not-found.tsx/
 * error.tsx, and keeps this simple since competitors' lock screens are
 * generic too, not fully themed. */
export default function SitePasswordGate({ eventId, title }: SitePasswordGateProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await unlockSitePassword(eventId, password);
      if (!result.ok) throw new Error(result.message);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl">🔒</p>
      <h1 className="text-2xl font-semibold text-stone-900">{title}</h1>
      <p className="max-w-sm text-sm text-stone-500">
        Enter the password to view this site.
      </p>
      <form onSubmit={handleSubmit} className="mt-2 flex w-full max-w-xs flex-col items-stretch gap-2">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoFocus
          className="rounded-full border border-stone-300 px-4 py-2 text-center text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting || !password}
          className="rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Checking…" : "View site"}
        </button>
      </form>
    </div>
  );
}
