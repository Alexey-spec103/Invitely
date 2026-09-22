"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { togglePublish } from "./[eventId]/actions";

interface PublishToggleProps {
  eventId: string;
  status: string;
}

export default function PublishToggle({ eventId, status }: PublishToggleProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPublished = status === "published";

  const handleClick = async () => {
    setError(null);
    setIsPending(true);
    const result = await togglePublish(eventId);
    if (result.ok) {
      router.refresh();
    } else {
      setError(result.message);
    }
    setIsPending(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={
          isPublished
            ? "rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-4 py-2.5 text-sm font-bold text-[var(--dash-text)] transition hover:border-[var(--dash-accent)] disabled:cursor-not-allowed disabled:opacity-60"
            : "rounded-full bg-[var(--dash-accent)] px-4 py-2.5 text-sm font-bold text-[var(--dash-accent-contrast)] shadow-[0_6px_16px_rgba(255,107,69,0.35)] transition hover:bg-[var(--dash-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {isPending ? "Saving..." : isPublished ? "Unpublish" : "Publish site"}
      </button>
      <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
        {isPublished
          ? "Your site is visible to guests via the link"
          : "Guests can't see your site until it's published"}
      </p>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
