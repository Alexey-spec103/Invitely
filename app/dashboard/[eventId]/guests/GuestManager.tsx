"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  addGuest,
  updateGuest,
  deleteGuest,
  addGuestAttendee,
  deleteGuestAttendee,
  setInvitationSent,
} from "./actions";
import BulkAddGuests from "./BulkAddGuests";
import { normalizeGuestName } from "./parseGuestLines";
import type { Tables } from "@/lib/supabase/database.types";

const guestFormSchema = z.object({
  fullName: z.string().min(1, "Enter a name"),
  email: z.string().email("Enter a valid email").or(z.literal("")),
  phone: z
    .string()
    .refine((value) => value === "" || /^[0-9+\-()\s]{6,20}$/.test(value), "Enter a valid phone number"),
  groupLabel: z.string(),
  maxPlusOnes: z.string(),
});

type GuestFormValues = z.infer<typeof guestFormSchema>;

interface GuestManagerProps {
  eventId: string;
  eventSlug: string;
  guests: Tables<"guests">[];
  attendees: Tables<"guest_attendees">[];
  /** guestId -> attending, only present once that guest has actually RSVP'd. */
  rsvpStatusByGuestId: Record<string, boolean>;
}

function ShareLinkBanner({ eventSlug }: { eventSlug: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/e/${eventSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <div className="mt-6 rounded-md border border-rose-100 bg-rose-50 px-4 py-3">
      <p className="text-sm font-medium text-rose-900">
        ✨ Short on time to add every guest by hand?
      </p>
      <p className="mt-1 text-xs text-rose-700">
        Share your site&apos;s one link with everyone — anyone who RSVPs from it is added to your
        guest list automatically, no invite codes needed.
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700 shadow-sm hover:bg-rose-100"
      >
        {copied ? "Link copied!" : "Copy site link"}
      </button>
    </div>
  );
}

function RsvpStatusBadge({ status }: { status: boolean | undefined }) {
  if (status === undefined) return null;
  return (
    <span
      className={
        status
          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
          : "rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700"
      }
    >
      {status ? "Confirmed" : "Declined"}
    </span>
  );
}

function CopyInviteLinkButton({
  guestId,
  slug,
  inviteCode,
}: {
  guestId: string;
  slug: string;
  inviteCode: string | null;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!inviteCode) return null;

  const handleCopy = async () => {
    const url = `${window.location.origin}/e/${slug}?invite=${inviteCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
    // Copying the link is the overwhelmingly common way a host actually
    // sends an invite (paste into a text/WhatsApp/email), so mark it sent
    // automatically -- a manual toggle on the badge covers any other
    // channel (e.g. a paper invite photographed and texted separately).
    try {
      await setInvitationSent(guestId, true);
      router.refresh();
    } catch {
      // Non-critical -- the link was still copied successfully either way.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

function InvitationSentBadge({ guestId, sent }: { guestId: string; sent: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleToggle = async () => {
    setPending(true);
    try {
      await setInvitationSent(guestId, !sent);
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className={
        sent
          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          : "rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
      }
      title={sent ? "Click to mark as not sent" : "Click to mark as sent"}
    >
      {sent ? "Sent" : "Not sent"}
    </button>
  );
}

function AttendeeList({
  guestId,
  attendees,
}: {
  guestId: string;
  attendees: Tables<"guest_attendees">[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      await addGuestAttendee(guestId, trimmed);
      setName("");
      router.refresh();
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (attendeeId: string) => {
    setRemovingId(attendeeId);
    try {
      await deleteGuestAttendee(attendeeId);
      router.refresh();
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="mt-2 pl-3">
      {attendees.length > 0 && (
        <ul className="space-y-1">
          {attendees.map((attendee) => (
            <li key={attendee.id} className="flex items-center justify-between gap-2 text-xs text-gray-600">
              <span>{attendee.full_name}</span>
              <button
                type="button"
                onClick={() => handleRemove(attendee.id)}
                disabled={removingId === attendee.id}
                className="text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-1.5 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleAdd();
            }
          }}
          placeholder="Name an attendee"
          className="w-full max-w-xs rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || !name.trim()}
          className="whitespace-nowrap rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {adding ? "Adding..." : "+ Add"}
        </button>
      </div>
    </div>
  );
}

function EditGuestForm({
  guest,
  onDone,
  onCancel,
}: {
  guest: Tables<"guests">;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      fullName: guest.full_name,
      email: guest.email ?? "",
      phone: guest.phone ?? "",
      groupLabel: guest.group_label ?? "",
      maxPlusOnes: guest.max_plus_ones != null ? String(guest.max_plus_ones) : "",
    },
  });

  const onSubmit = async (values: GuestFormValues) => {
    setFormError(null);
    try {
      await updateGuest({
        guestId: guest.id,
        ...values,
        maxPlusOnes: values.maxPlusOnes ? Number(values.maxPlusOnes) : undefined,
      });
      router.refresh();
      onDone();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 grid gap-3 sm:grid-cols-2" noValidate>
      <div>
        <label htmlFor={`edit-fullName-${guest.id}`} className="block text-xs font-medium text-gray-700">
          Full name
        </label>
        <input
          id={`edit-fullName-${guest.id}`}
          type="text"
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("fullName")}
        />
        {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
      </div>

      <div>
        <label htmlFor={`edit-groupLabel-${guest.id}`} className="block text-xs font-medium text-gray-700">
          Group
        </label>
        <input
          id={`edit-groupLabel-${guest.id}`}
          type="text"
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("groupLabel")}
        />
      </div>

      <div>
        <label htmlFor={`edit-email-${guest.id}`} className="block text-xs font-medium text-gray-700">
          Email
        </label>
        <input
          id={`edit-email-${guest.id}`}
          type="email"
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor={`edit-phone-${guest.id}`} className="block text-xs font-medium text-gray-700">
          Phone
        </label>
        <input
          id={`edit-phone-${guest.id}`}
          type="tel"
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("phone")}
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
      </div>

      <div>
        <label htmlFor={`edit-maxPlusOnes-${guest.id}`} className="block text-xs font-medium text-gray-700">
          Plus-ones allowed
        </label>
        <input
          id={`edit-maxPlusOnes-${guest.id}`}
          type="number"
          min={0}
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("maxPlusOnes")}
        />
      </div>

      {formError && (
        <p className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {formError}
        </p>
      )}

      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function GuestManager({
  eventId,
  eventSlug,
  guests,
  attendees,
  rsvpStatusByGuestId,
}: GuestManagerProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return guests;
    return guests.filter((guest) =>
      [guest.full_name, guest.group_label, guest.email, guest.phone]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query))
    );
  }, [guests, search]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: { fullName: "", email: "", phone: "", groupLabel: "" },
  });

  const onSubmit = async (values: GuestFormValues) => {
    setFormError(null);
    const isDuplicate = guests.some(
      (guest) => normalizeGuestName(guest.full_name) === normalizeGuestName(values.fullName)
    );
    if (isDuplicate && !window.confirm(`"${values.fullName}" looks like a guest you already added. Add another one anyway?`)) {
      return;
    }
    try {
      await addGuest({
        eventId,
        ...values,
        maxPlusOnes: values.maxPlusOnes ? Number(values.maxPlusOnes) : undefined,
      });
      reset();
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleDelete = async (guestId: string) => {
    if (!window.confirm("Remove this guest?")) {
      return;
    }
    setDeletingId(guestId);
    try {
      await deleteGuest(guestId);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <ShareLinkBanner eventSlug={eventSlug} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 grid gap-4 border-t border-gray-200 pt-8 sm:grid-cols-2"
        noValidate
      >
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="groupLabel" className="block text-sm font-medium text-gray-700">
            Group <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="groupLabel"
            type="text"
            placeholder="Family, friends..."
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            {...register("groupLabel")}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            {...register("phone")}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="maxPlusOnes" className="block text-sm font-medium text-gray-700">
            Plus-ones allowed <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="maxPlusOnes"
            type="number"
            min={0}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            {...register("maxPlusOnes")}
          />
        </div>

        {formError && (
          <p className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Adding..." : "Add guest"}
          </button>
        </div>
      </form>

      <BulkAddGuests eventId={eventId} existingGuests={guests} />

      {guests.length > 0 && (
        <div className="mt-8 flex items-center justify-between gap-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search guests by name, group, email, phone..."
            className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
          <span className="whitespace-nowrap text-xs text-gray-500">
            {filteredGuests.length} of {guests.length} guest{guests.length === 1 ? "" : "s"}
          </span>
        </div>
      )}

      <ul className={`divide-y divide-gray-200 border-t border-gray-200 ${guests.length > 0 ? "mt-4" : "mt-8"}`}>
        {guests.length === 0 && (
          <li className="py-4 text-sm text-gray-500">No guests yet — add your first one above. 🎈</li>
        )}
        {guests.length > 0 && filteredGuests.length === 0 && (
          <li className="py-4 text-sm text-gray-500">No guests match &ldquo;{search}&rdquo;.</li>
        )}
        {filteredGuests.map((guest) => {
          const rsvpStatus = rsvpStatusByGuestId[guest.id];
          return (
          <li
            key={guest.id}
            className={
              "py-3 px-2 -mx-2 rounded-md " +
              (rsvpStatus === true ? "bg-emerald-50/60" : rsvpStatus === false ? "bg-rose-50/60" : "")
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">Dear {guest.full_name}!</p>
                  <InvitationSentBadge guestId={guest.id} sent={guest.invitation_sent_at != null} />
                  <RsvpStatusBadge status={rsvpStatus} />
                </div>
                <p className="text-xs text-gray-500">
                  {[guest.group_label, guest.email, guest.phone].filter(Boolean).join(" · ")}
                </p>
              </div>
              {editingId !== guest.id && (
                <div className="flex items-center gap-3">
                  <CopyInviteLinkButton guestId={guest.id} slug={eventSlug} inviteCode={guest.invite_code} />
                  <button
                    type="button"
                    onClick={() => setEditingId(guest.id)}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(guest.id)}
                    disabled={deletingId === guest.id}
                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === guest.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              )}
            </div>
            {editingId === guest.id && (
              <EditGuestForm
                guest={guest}
                onDone={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            )}
            <AttendeeList
              guestId={guest.id}
              attendees={attendees.filter((attendee) => attendee.guest_id === guest.id)}
            />
          </li>
          );
        })}
      </ul>
    </div>
  );
}
