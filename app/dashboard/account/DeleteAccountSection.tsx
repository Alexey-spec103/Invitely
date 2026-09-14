"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteOwnAccount } from "./actions";

interface DeleteAccountSectionProps {
  currentEmail: string;
}

export default function DeleteAccountSection({ currentEmail }: DeleteAccountSectionProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [typedValue, setTypedValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // An anonymous trial account has no email yet -- fall back to a literal
  // phrase to type instead of an empty (trivially-satisfied) string.
  const confirmText = currentEmail.trim() || "DELETE";
  const canDelete = typedValue.trim() === confirmText;

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);
    try {
      await deleteOwnAccount();
      // The deleted user's JWT stays cryptographically valid until it would
      // naturally expire/refresh -- sign out explicitly so the browser's
      // own session clears immediately instead of waiting on that.
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6">
      <h2 className="dash-h2 text-sm text-red-900">Danger zone</h2>
      <p className="mt-1 text-sm text-red-700">
        Permanently delete your account and everything in it &mdash; every event you own, its
        guests, RSVPs, gift wishes, banquet tables, and site content. This cannot be undone.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          Delete my account
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <label htmlFor="confirm-delete-account" className="block text-sm text-red-700">
            Type <span className="font-semibold">{confirmText}</span> to confirm.
          </label>
          <input
            id="confirm-delete-account"
            type="text"
            value={typedValue}
            onChange={(event) => setTypedValue(event.target.value)}
            className="w-full rounded-md border border-red-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={!canDelete || isDeleting}
              className="rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Permanently delete"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setTypedValue("");
                setError(null);
              }}
              disabled={isDeleting}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
