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
    try {
      await togglePublish(eventId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={
          isPublished
            ? "rounded-full bg-stone-100 px-4 py-2.5 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
            : "rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_1px_0_rgba(4,120,87,1),0_6px_12px_rgba(16,185,129,0.35)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {isPending ? "Saving..." : isPublished ? "Unpublish" : "Publish site"}
      </button>
      <p className="mt-1 text-xs text-stone-500">
        {isPublished
          ? "Your site is visible to guests via the link"
          : "Guests can't see your site until it's published"}
      </p>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
