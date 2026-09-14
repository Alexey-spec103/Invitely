"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  linkRsvpResponseToGuest,
  toggleGuestbookVisibility,
  setAllGuestbookVisibility,
  deleteRsvpResponse,
} from "./actions";
import { formatAnswers, type RsvpQuestionLabel } from "./formatAnswers";
import type { Tables } from "@/lib/supabase/database.types";

interface RsvpResponsesProps {
  eventId: string;
  responses: Tables<"rsvp_responses">[];
  guests: Tables<"guests">[];
  questions: RsvpQuestionLabel[];
}

export default function RsvpResponses({ eventId, responses, guests, questions }: RsvpResponsesProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [bulkPending, setBulkPending] = useState<"hide" | "show" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const commentedCount = responses.filter(
    (response) => response.comment && response.comment.trim().length > 0
  ).length;

  const filteredResponses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return responses;
    return responses.filter((response) => response.guest_name.toLowerCase().includes(query));
  }, [responses, search]);

  const handleDelete = async (responseId: string) => {
    if (!window.confirm("Delete this RSVP response? This can't be undone.")) {
      return;
    }
    setError(null);
    setPendingId(responseId);
    try {
      await deleteRsvpResponse(responseId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setPendingId(null);
    }
  };

  const handleLink = async (responseId: string, value: string) => {
    setError(null);
    setPendingId(responseId);
    try {
      await linkRsvpResponseToGuest({ responseId, guestId: value || null });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setPendingId(null);
    }
  };

  const handleToggleGuestbook = async (responseId: string, hidden: boolean) => {
    setError(null);
    setPendingId(responseId);
    try {
      await toggleGuestbookVisibility(responseId, hidden);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setPendingId(null);
    }
  };

  const handleBulkGuestbook = async (hidden: boolean) => {
    setError(null);
    setBulkPending(hidden ? "hide" : "show");
    try {
      await setAllGuestbookVisibility(eventId, hidden);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setBulkPending(null);
    }
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="dash-h2 text-lg text-[var(--dash-accent-text)]">RSVP responses</h2>
      <p className="mt-1 text-sm text-gray-500">
        Match each response to someone on your guest list above, if you&apos;d like.
      </p>

      {commentedCount > 1 && (
        <div className="mt-3 flex items-center gap-3 text-xs">
          <span className="text-gray-500">Guestbook wall ({commentedCount} messages):</span>
          <button
            type="button"
            onClick={() => handleBulkGuestbook(true)}
            disabled={bulkPending !== null}
            className="font-medium text-gray-600 underline hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bulkPending === "hide" ? "Hiding all..." : "Hide all"}
          </button>
          <button
            type="button"
            onClick={() => handleBulkGuestbook(false)}
            disabled={bulkPending !== null}
            className="font-medium text-gray-600 underline hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bulkPending === "show" ? "Showing all..." : "Show all"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {responses.length > 0 && (
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search responses by name..."
          className="dash-input mt-4 max-w-xs"
        />
      )}

      <ul className="mt-6 divide-y divide-gray-200 border-t border-gray-200">
        {responses.length === 0 && (
          <li className="list-none py-4">
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
              <span className="text-2xl" aria-hidden="true">
                📬
              </span>
              <span className="text-sm font-medium">No responses yet</span>
              <span className="text-xs text-gray-400">They&apos;ll show up here as guests RSVP</span>
            </div>
          </li>
        )}
        {responses.length > 0 && filteredResponses.length === 0 && (
          <li className="py-4 text-sm text-gray-500">No responses match &ldquo;{search}&rdquo;.</li>
        )}
        {filteredResponses.map((response) => {
          const answers = formatAnswers(response.meal_preferences, questions);
          return (
          <li key={response.id} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-900">{response.guest_name}</p>
              <span
                className={
                  response.attending
                    ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                    : "rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700"
                }
              >
                {response.attending ? "Attending" : "Not attending"}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {[
                response.attending ? `${response.party_size} guest(s)` : null,
                response.allergies,
                response.comment,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {answers.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {answers.map(({ label, answer }) => (
                  <li key={label} className="text-xs text-gray-500">
                    <span className="font-medium text-gray-600">{label}:</span> {answer}
                  </li>
                ))}
              </ul>
            )}
            {response.submitted_at && (
              <p className="mt-1 text-xs text-gray-400">
                {new Date(response.submitted_at).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            )}

            {response.comment && (
              <button
                type="button"
                onClick={() => handleToggleGuestbook(response.id, !response.guestbook_hidden)}
                disabled={pendingId === response.id}
                className="mt-1 text-xs font-medium text-gray-500 underline hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {response.guestbook_hidden ? "Hidden from guestbook — show" : "Visible in guestbook — hide"}
              </button>
            )}

            <div className="mt-2 flex items-center gap-3">
              <label className="sr-only" htmlFor={`link-${response.id}`}>
                Match to guest
              </label>
              <select
                id={`link-${response.id}`}
                value={response.guest_id ?? ""}
                disabled={pendingId === response.id}
                onChange={(event) => handleLink(response.id, event.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">— unmatched —</option>
                {guests.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.full_name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleDelete(response.id)}
                disabled={pendingId === response.id}
                className="text-xs font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingId === response.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
