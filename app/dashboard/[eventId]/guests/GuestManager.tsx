"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  recordInvitationSent,
  sendGuestInvitationEmail,
  sendBulkGuestInvitationEmails,
  sendBulkGuestReminderEmails,
  type SendChannel,
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
  paperEnabled: z.boolean(),
  siteEnabled: z.boolean(),
});

type GuestFormValues = z.infer<typeof guestFormSchema>;

interface GuestManagerProps {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  guests: Tables<"guests">[];
  attendees: Tables<"guest_attendees">[];
  /** guestId -> attending, only present once that guest has actually RSVP'd. */
  rsvpStatusByGuestId: Record<string, boolean>;
}

/** dashboard-audit.md follow-up: "Copy site link" alone meant a host still
 * had to paste it into WhatsApp/email themselves -- same compose-window
 * pattern SendInviteMenu already proved for per-guest links (wa.me / sms: /
 * mailto:), just pointed at the general site link instead of one guest's
 * invite code, and with no phone/email lookup needed since this is the
 * host sharing their own link, not inviting one specific person. */
function ShareLinkBanner({ eventSlug, eventTitle }: { eventSlug: string; eventTitle: string }) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shareOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [shareOpen]);

  const getUrl = () => `${window.location.origin}/e/${eventSlug}`;

  const handleCopy = async () => {
    const url = getUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const handleShare = (channel: "whatsapp" | "sms" | "email") => {
    setShareOpen(false);
    const url = getUrl();
    const message = `You're invited to ${eventTitle}! RSVP here: ${url}`;
    if (channel === "whatsapp") {
      // No phone number -- wa.me with no number opens WhatsApp's own
      // contact picker instead of a single prefilled chat.
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    } else if (channel === "sms") {
      window.location.href = `sms:?&body=${encodeURIComponent(message)}`;
    } else {
      window.location.href = `mailto:?subject=${encodeURIComponent(`You're invited to ${eventTitle}`)}&body=${encodeURIComponent(message)}`;
    }
  };

  return (
    <div className="mt-6 rounded-2xl bg-[color-mix(in_srgb,var(--dash-accent)_10%,white)] px-4 py-3">
      <p className="text-sm font-semibold text-gray-900">
        ✨ Short on time to add every guest by hand?
      </p>
      <p className="mt-1 text-xs text-gray-600">
        Share your site&apos;s one link with everyone — anyone who RSVPs from it is added to your
        guest list automatically, no invite codes needed.
      </p>
      <p className="mt-1 text-xs text-gray-600">
        Add guests individually below instead if you&apos;d rather track who&apos;s RSVP&apos;d by name — each one gets
        their own personal link, separate from this shared one.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <button type="button" onClick={handleCopy} className="dash-btn dash-btn-secondary px-3 py-1 text-xs">
          {copied ? "Link copied!" : "Copy site link"}
        </button>
        <div ref={shareRef} className="relative inline-block">
          <button
            type="button"
            onClick={() => setShareOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={shareOpen}
            className="dash-btn dash-btn-secondary px-3 py-1 text-xs"
          >
            Share link ↗
          </button>
          {shareOpen && (
            <div
              role="menu"
              className="absolute left-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => handleShare("whatsapp")}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
              >
                💬 WhatsApp
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => handleShare("sms")}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
              >
                📱 SMS
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => handleShare("email")}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
              >
                ✉️ Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** dashboard-audit.md A7: weddingpost.ru's own "New invitation" modal has two
 * orange toggles (paper icon / phone icon), both on by default, above the
 * name/phone/email fields -- confirmed live in Chrome. A native checkbox
 * (not the custom `role="switch"` button used elsewhere in the dashboard)
 * since this form already runs on react-hook-form's `register`, and a real
 * checkbox is the idiomatic way to wire a boolean into that. */
/** dashboard-audit.md "fresh eyes" finding #6: these two toggles weren't
 * explained anywhere -- a host had to guess what each one actually
 * controls. `hint` renders a short caption under the label. */
function ToggleCheckbox({
  label,
  icon,
  hint,
  registration,
}: {
  label: string;
  icon: string;
  hint: string;
  registration: ReturnType<ReturnType<typeof useForm<GuestFormValues>>["register"]>;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-xs font-medium text-gray-700">
      <span className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center">
        <input type="checkbox" className="peer sr-only" {...registration} />
        <span className="absolute inset-0 rounded-full bg-gray-300 transition peer-checked:bg-[var(--dash-accent)]" />
        <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
      </span>
      <span className="flex flex-col">
        <span>
          <span aria-hidden="true">{icon}</span> {label}
        </span>
        <span className="font-normal text-gray-500">{hint}</span>
      </span>
    </label>
  );
}

type GuestStatus = "created" | "sent" | "accepted" | "declined";
type StatusFilter = "all" | GuestStatus;

function getGuestStatus(
  guest: Tables<"guests">,
  rsvpStatusByGuestId: Record<string, boolean>
): GuestStatus {
  const rsvp = rsvpStatusByGuestId[guest.id];
  if (rsvp === true) return "accepted";
  if (rsvp === false) return "declined";
  return guest.invitation_sent_at != null ? "sent" : "created";
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "created", label: "Created" },
  { key: "sent", label: "Sent" },
  { key: "accepted", label: "Accepted" },
  { key: "declined", label: "Declined" },
];

/** dashboard-audit.md A8: weddingpost.ru's guest widget (on its finish/invite
 * screen, not its bare guests page) has a single-select pill row -- Все /
 * Созданы / Отправлены / Приняты / Отказ, each with a live count -- confirmed
 * live in Chrome. A response overrides "sent": an accepted/declined guest
 * shows there, not under "Sent", matching getGuestStatus's precedence. */
function StatusPills({
  counts,
  active,
  onChange,
}: {
  counts: Record<StatusFilter, number>;
  active: StatusFilter;
  onChange: (status: StatusFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUS_FILTERS.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition " +
              (isActive
                ? "bg-[var(--dash-accent)] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200")
            }
          >
            {label}
            <span
              className={
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold " +
                (isActive ? "bg-white/25 text-white" : "bg-gray-200 text-gray-600")
              }
            >
              {counts[key]}
            </span>
          </button>
        );
      })}
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
    // sends an invite (paste into a text/WhatsApp/email), so record it as a
    // "link" send automatically -- dashboard-audit.md B18's SendInviteMenu
    // below covers the other channels, and the manual toggle on the badge
    // covers anything else (e.g. a paper invite photographed and texted).
    try {
      await recordInvitationSent(guestId, "link");
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

const CHANNEL_ICONS: Record<SendChannel, string> = {
  link: "🔗",
  whatsapp: "💬",
  sms: "📱",
  email: "✉️",
};
const CHANNEL_LABELS: Record<SendChannel, string> = {
  link: "link copied",
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "email",
};

function InvitationSentBadge({
  guestId,
  sent,
  channels,
}: {
  guestId: string;
  sent: boolean;
  channels: string[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  // Same gap as the other toggles fixed in this file: setInvitationSent
  // throws on failure, and this had no `catch` at all, just `finally` --
  // a failed click looked identical to a successful one.
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    setError(null);
    setPending(true);
    try {
      await setInvitationSent(guestId, !sent);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setPending(false);
    }
  };

  const knownChannels = channels.filter((channel): channel is SendChannel => channel in CHANNEL_ICONS);

  return (
    <span className="inline-flex items-center gap-1">
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className={
        sent
          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          : "rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
      }
      title={
        sent
          ? knownChannels.length > 0
            ? `Sent via ${knownChannels.map((channel) => CHANNEL_LABELS[channel]).join(", ")} — click to mark as not sent`
            : "Click to mark as not sent"
          : "Click to mark as sent"
      }
    >
      {sent ? "Sent" : "Not sent"}
      {sent && knownChannels.length > 0 && (
        <span className="ml-1" aria-hidden="true">
          {knownChannels.map((channel) => CHANNEL_ICONS[channel]).join(" ")}
        </span>
      )}
    </button>
    {error && <span className="text-[10px] text-red-600">{error}</span>}
    </span>
  );
}

/** dashboard-audit.md B18: "Отправка SMS / мессенджер" -- Invimbo has no
 * real SMS delivery backend, so WhatsApp/SMS open the host's own phone
 * compose window pre-filled with the guest's personal RSVP link (same
 * pattern any "share" button on the web uses). Email is real server-side
 * delivery via Resend (see sendGuestInvitationEmail) -- all three record
 * which channel was used via `recordInvitationSent`. Hidden entirely when
 * there's neither a phone nor an email to send to. */
function SendInviteMenu({
  guestId,
  guestName,
  slug,
  inviteCode,
  phone,
  email,
  eventTitle,
}: {
  guestId: string;
  guestName: string;
  slug: string;
  inviteCode: string | null;
  phone: string | null;
  email: string | null;
  eventTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if ((!phone && !email) || !inviteCode) return null;

  const handleSend = async (channel: Extract<SendChannel, "sms" | "whatsapp">) => {
    setOpen(false);
    const url = `${window.location.origin}/e/${slug}?invite=${inviteCode}`;
    const message = `Hi ${guestName}! You're invited to ${eventTitle}. RSVP here: ${url}`;

    if (channel === "whatsapp" && phone) {
      const digits = phone.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    } else if (channel === "sms" && phone) {
      window.location.href = `sms:${phone}?&body=${encodeURIComponent(message)}`;
    }

    try {
      await recordInvitationSent(guestId, channel);
      router.refresh();
    } catch {
      // Non-critical -- the compose window still opened either way.
    }
  };

  const handleSendEmail = async () => {
    setOpen(false);
    setEmailError(null);
    setSendingEmail(true);
    try {
      const url = `${window.location.origin}/e/${slug}?invite=${inviteCode}`;
      const result = await sendGuestInvitationEmail(guestId, url);
      if (!result.ok) throw new Error(result.message);
      router.refresh();
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        Send
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {phone && (
            <button
              type="button"
              role="menuitem"
              onClick={() => handleSend("whatsapp")}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
            >
              💬 WhatsApp
            </button>
          )}
          {phone && (
            <button
              type="button"
              role="menuitem"
              onClick={() => handleSend("sms")}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
            >
              📱 SMS
            </button>
          )}
          {email && (
            <button
              type="button"
              role="menuitem"
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ✉️ {sendingEmail ? "Sending..." : "Email"}
            </button>
          )}
        </div>
      )}
      {emailError && (
        <p className="absolute right-0 top-full mt-1 w-48 rounded-md bg-red-50 px-2 py-1 text-[11px] text-red-700 shadow-sm">
          {emailError}
        </p>
      )}
    </div>
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
  // Both actions below throw on failure (not the {ok, message} return shape
  // some other actions in this file use) -- this component had no `catch`
  // at all, just `try/finally`, so a failed add/remove surfaced as nothing
  // more than an uncaught rejection in the console. Same red-text
  // convention the parent GuestManager's own formError already uses.
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    setAdding(true);
    try {
      await addGuestAttendee(guestId, trimmed);
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (attendeeId: string, attendeeName: string) => {
    // Matches the confirm() gate the top-level guest delete already uses
    // below -- this one had none at all, so a misclick silently dropped a
    // named person off the invitation with no recovery.
    if (!window.confirm(`Remove ${attendeeName} from this invitation?`)) {
      return;
    }
    setError(null);
    setRemovingId(attendeeId);
    try {
      await deleteGuestAttendee(attendeeId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="mt-2 pl-3">
      {/* dashboard-audit.md A7: "приглашение ≠ гость" -- this is that model
          made visible. A guest row is really an invited party (one QR, one
          status), and this is how you name the other people inside it
          ("Mom and Dad" on one invite, not two separate rows) -- easy to
          miss without saying so, since it's just a small input tucked under
          each guest. */}
      <p className="text-xs text-gray-400">Add more people to this invitation:</p>
      {attendees.length > 0 && (
        <ul className="space-y-1">
          {attendees.map((attendee) => (
            <li key={attendee.id} className="flex items-center justify-between gap-2 text-xs text-gray-600">
              <span>{attendee.full_name}</span>
              <button
                type="button"
                onClick={() => handleRemove(attendee.id, attendee.full_name)}
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
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
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
      paperEnabled: guest.paper_enabled,
      siteEnabled: guest.site_enabled,
    },
  });

  const onSubmit = async (values: GuestFormValues) => {
    setFormError(null);
    try {
      const result = await updateGuest({
        guestId: guest.id,
        ...values,
        maxPlusOnes: values.maxPlusOnes ? Number(values.maxPlusOnes) : undefined,
      });
      if (!result.ok) throw new Error(result.message);
      router.refresh();
      onDone();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 grid gap-3 sm:grid-cols-2" noValidate>
      <div className="flex items-start gap-4 sm:col-span-2">
        <ToggleCheckbox
          label="Paper invite"
          icon="📄"
          hint="Include in printed/PDF invitations"
          registration={register("paperEnabled")}
        />
        <ToggleCheckbox
          label="Site invite"
          icon="📱"
          hint="Give them a personal RSVP link to your site"
          registration={register("siteEnabled")}
        />
      </div>

      <div>
        <label htmlFor={`edit-fullName-${guest.id}`} className="block text-xs font-semibold text-gray-900">
          Full name
        </label>
        <input id={`edit-fullName-${guest.id}`} type="text" className="dash-input mt-1 text-sm" {...register("fullName")} />
        {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
      </div>

      <div>
        <label htmlFor={`edit-groupLabel-${guest.id}`} className="block text-xs font-semibold text-gray-900">
          Group
        </label>
        <input id={`edit-groupLabel-${guest.id}`} type="text" className="dash-input mt-1 text-sm" {...register("groupLabel")} />
      </div>

      <div>
        <label htmlFor={`edit-email-${guest.id}`} className="block text-xs font-semibold text-gray-900">
          Email
        </label>
        <input id={`edit-email-${guest.id}`} type="email" className="dash-input mt-1 text-sm" {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor={`edit-phone-${guest.id}`} className="block text-xs font-semibold text-gray-900">
          Phone
        </label>
        <input id={`edit-phone-${guest.id}`} type="tel" className="dash-input mt-1 text-sm" {...register("phone")} />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
      </div>

      <div>
        <label htmlFor={`edit-maxPlusOnes-${guest.id}`} className="block text-xs font-semibold text-gray-900">
          Plus-ones allowed
        </label>
        <input
          id={`edit-maxPlusOnes-${guest.id}`}
          type="number"
          min={0}
          className="dash-input mt-1 text-sm"
          {...register("maxPlusOnes")}
        />
      </div>

      {formError && (
        <p className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {formError}
        </p>
      )}

      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={isSubmitting} className="dash-btn dash-btn-primary px-3 py-1.5 text-xs">
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
  eventTitle,
  guests,
  attendees,
  rsvpStatusByGuestId,
}: GuestManagerProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  // One-click counterpart to clicking "Send" -> "Email" on every guest row
  // in turn -- sendBulkGuestInvitationEmails already skips anyone with no
  // email on file or already marked sent, so this is always safe to offer
  // whenever at least one guest could plausibly still need one.
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  // Reminder counterpart to the bulk-invite flow above -- same optimistic-
  // free, sequential sendBulkGuestReminderEmails call, just a different
  // eligible pool (already sent, still no response) and its own pending/
  // result state so the two actions' loading spinners never collide.
  const [reminderSending, setReminderSending] = useState(false);
  const [reminderResult, setReminderResult] = useState<string | null>(null);
  // impeccable critique (Flexibility and Efficiency): the only way to remove
  // guests at scale was one-by-one, even right after a messy bulk import.
  // Bulk removal shares the same undo-toast path as single removal below
  // rather than adding a parallel bulk server action.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // impeccable critique "Questions to Consider" #3: a window.confirm()-then-
  // gone dialog is unforgiving when working through a list quickly, and this
  // project has no soft-delete column to build a true undo on. Removing a
  // guest now hides them immediately (optimistic, via hiddenIds) but delays
  // the actual deleteGuest call behind a dismissible toast -- a misclick is
  // recoverable for a few seconds without touching the schema.
  const UNDO_WINDOW_MS = 5000;
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [pendingRemoval, setPendingRemoval] = useState<{
    ids: string[];
    label: string;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);
  // dashboard-audit.md: removal shows a clear "Removed X. Undo" toast, but
  // adding a guest gave no feedback at all -- the form just cleared. Same
  // fixed-bottom-right toast shell as pendingRemoval below, just without an
  // Undo action (there's nothing to undo).
  const [addedGuestName, setAddedGuestName] = useState<string | null>(null);
  const addedToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: guests.length,
      created: 0,
      sent: 0,
      accepted: 0,
      declined: 0,
    };
    for (const guest of guests) {
      counts[getGuestStatus(guest, rsvpStatusByGuestId)] += 1;
    }
    return counts;
  }, [guests, rsvpStatusByGuestId]);

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return guests.filter((guest) => {
      if (hiddenIds.has(guest.id)) return false;
      if (statusFilter !== "all" && getGuestStatus(guest, rsvpStatusByGuestId) !== statusFilter) {
        return false;
      }
      if (!query) return true;
      return [guest.full_name, guest.group_label, guest.email, guest.phone]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query));
    });
  }, [guests, search, statusFilter, rsvpStatusByGuestId, hiddenIds]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: { fullName: "", email: "", phone: "", groupLabel: "", paperEnabled: true, siteEnabled: true },
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
      const result = await addGuest({
        eventId,
        ...values,
        maxPlusOnes: values.maxPlusOnes ? Number(values.maxPlusOnes) : undefined,
      });
      if (!result.ok) throw new Error(result.message);
      reset();
      router.refresh();
      if (addedToastTimeoutRef.current) clearTimeout(addedToastTimeoutRef.current);
      setAddedGuestName(values.fullName);
      addedToastTimeoutRef.current = setTimeout(() => setAddedGuestName(null), UNDO_WINDOW_MS);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  // Shared by single and bulk removal: hides `ids` immediately, commits the
  // real deleteGuest calls only after UNDO_WINDOW_MS with nothing clicked.
  // Any still-pending removal is committed first -- two overlapping undo
  // windows would need their own toast each, which isn't worth the
  // complexity for how rarely a host would remove, then remove again, inside
  // the same 5 seconds.
  const commitPendingRemoval = async (removal: NonNullable<typeof pendingRemoval>) => {
    try {
      for (const guestId of removal.ids) {
        const result = await deleteGuest(guestId);
        if (!result.ok) throw new Error(result.message);
      }
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete");
      // The call failed, so these guests were never actually removed --
      // bring them back into view rather than leaving them stuck hidden.
      setHiddenIds((prev) => {
        const next = new Set(prev);
        for (const id of removal.ids) next.delete(id);
        return next;
      });
    }
  };

  const startRemoval = (ids: string[], label: string) => {
    if (pendingRemoval) {
      clearTimeout(pendingRemoval.timeoutId);
      void commitPendingRemoval(pendingRemoval);
    }
    setFormError(null);
    setHiddenIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
    // Committing from inside a setPendingRemoval *updater* (reading the
    // latest value, like the clearTimeout guard above wants) triggers React's
    // "Cannot update a component while rendering a different component" --
    // an updater has to stay a pure state calculation, never a place to kick
    // off side effects. `clearTimeout` on startRemoval's own re-entry (above)
    // already guarantees a stale timeout can never fire, so there's nothing
    // left to guard here; setPendingRemoval(null) and the actual commit can
    // both just be plain statements in this ordinary timer callback.
    const timeoutId = setTimeout(() => {
      setPendingRemoval(null);
      void commitPendingRemoval({ ids, label, timeoutId });
    }, UNDO_WINDOW_MS);
    setPendingRemoval({ ids, label, timeoutId });
  };

  const handleDelete = (guestId: string, guestName: string) => {
    startRemoval([guestId], guestName);
  };

  const handleUndoRemoval = () => {
    if (!pendingRemoval) return;
    clearTimeout(pendingRemoval.timeoutId);
    setHiddenIds((prev) => {
      const next = new Set(prev);
      for (const id of pendingRemoval.ids) next.delete(id);
      return next;
    });
    setPendingRemoval(null);
  };

  const toggleSelected = (guestId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(guestId)) next.delete(guestId);
      else next.add(guestId);
      return next;
    });
  };

  const allVisibleSelected = filteredGuests.length > 0 && filteredGuests.every((guest) => selectedIds.has(guest.id));

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        for (const guest of filteredGuests) next.delete(guest.id);
        return next;
      }
      const next = new Set(prev);
      for (const guest of filteredGuests) next.add(guest.id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    startRemoval(Array.from(selectedIds), `${count} guest${count === 1 ? "" : "s"}`);
    setSelectedIds(new Set());
  };

  const eligibleForBulkEmail = guests.filter(
    (guest) => guest.site_enabled && guest.email && guest.invite_code && guest.invitation_sent_at == null
  ).length;

  // Same precedence getGuestStatus already uses: a guest only counts as
  // "hasn't responded" when they have no rsvp_responses row at all --
  // rsvpStatusByGuestId[id] is undefined for them, true/false once they have.
  const eligibleForReminder = guests.filter(
    (guest) =>
      guest.site_enabled &&
      guest.email &&
      guest.invite_code &&
      guest.invitation_sent_at != null &&
      rsvpStatusByGuestId[guest.id] === undefined
  ).length;

  const handleBulkSendEmails = async () => {
    setBulkSending(true);
    setBulkResult(null);
    try {
      const result = await sendBulkGuestInvitationEmails(eventId, window.location.origin);
      if (!result.ok) throw new Error(result.message);
      const parts = [`Sent to ${result.sent} guest${result.sent === 1 ? "" : "s"}`];
      if (result.skipped > 0) parts.push(`${result.skipped} skipped (no email on file or already sent)`);
      if (result.failed.length > 0) parts.push(`${result.failed.length} failed`);
      setBulkResult(parts.join(" — "));
      router.refresh();
    } catch (err) {
      setBulkResult(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setBulkSending(false);
    }
  };

  const handleSendReminders = async () => {
    setReminderSending(true);
    setReminderResult(null);
    try {
      const result = await sendBulkGuestReminderEmails(eventId, window.location.origin);
      if (!result.ok) throw new Error(result.message);
      const parts = [`Reminded ${result.sent} guest${result.sent === 1 ? "" : "s"}`];
      if (result.skipped > 0) parts.push(`${result.skipped} skipped (no email on file or already responded)`);
      if (result.failed.length > 0) parts.push(`${result.failed.length} failed`);
      setReminderResult(parts.join(" — "));
    } catch (err) {
      setReminderResult(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setReminderSending(false);
    }
  };

  return (
    <div>
      <ShareLinkBanner eventSlug={eventSlug} eventTitle={eventTitle} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 grid gap-4 border-t border-gray-200 pt-8 sm:grid-cols-2"
        noValidate
      >
        <div className="flex items-start gap-4 sm:col-span-2">
          <ToggleCheckbox
            label="Paper invite"
            icon="📄"
            hint="Include in printed/PDF invitations"
            registration={register("paperEnabled")}
          />
          <ToggleCheckbox
            label="Site invite"
            icon="📱"
            hint="Give them a personal RSVP link to your site"
            registration={register("siteEnabled")}
          />
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="First & last name, no titles (e.g. Jamie Rivera)"
            className="dash-input mt-1"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="groupLabel" className="block text-sm font-semibold text-gray-900">
            Group <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="groupLabel"
            type="text"
            placeholder="Family, friends..."
            className="dash-input mt-1"
            {...register("groupLabel")}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
            Email <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="For emailing their invitation"
            className="dash-input mt-1"
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
            Phone <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="For SMS or WhatsApp"
            className="dash-input mt-1"
            {...register("phone")}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="maxPlusOnes" className="block text-sm font-semibold text-gray-900">
            Plus-ones allowed <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="maxPlusOnes"
            type="number"
            min={0}
            className="dash-input mt-1"
            {...register("maxPlusOnes")}
          />
        </div>

        {formError && (
          <p className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <div className="sm:col-span-2">
          <button type="submit" disabled={isSubmitting} className="dash-btn dash-btn-primary">
            {isSubmitting ? "Adding..." : "Add guest"}
          </button>
        </div>
      </form>

      <BulkAddGuests eventId={eventId} existingGuests={guests} />

      {guests.length > 0 && (
        <div className="mt-8 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guests by name, group, email, phone..."
              className="dash-input max-w-sm"
            />
            <span className="whitespace-nowrap text-xs text-gray-500">
              {filteredGuests.length} of {guests.length} guest{guests.length === 1 ? "" : "s"}
            </span>
          </div>
          <StatusPills counts={statusCounts} active={statusFilter} onChange={setStatusFilter} />
          {eligibleForBulkEmail > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleBulkSendEmails}
                disabled={bulkSending}
                className="dash-btn dash-btn-secondary px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bulkSending
                  ? "Sending..."
                  : `✉️ Email everyone who hasn't been sent one (${eligibleForBulkEmail})`}
              </button>
              {bulkResult && <span className="text-xs text-gray-500">{bulkResult}</span>}
            </div>
          )}
          {eligibleForReminder > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSendReminders}
                disabled={reminderSending}
                className="dash-btn dash-btn-secondary px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reminderSending
                  ? "Sending..."
                  : `⏰ Remind guests who haven't responded (${eligibleForReminder})`}
              </button>
              {reminderResult && <span className="text-xs text-gray-500">{reminderResult}</span>}
            </div>
          )}
          {selectedIds.size > 0 ? (
            <div className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  className="h-3.5 w-3.5 rounded border-gray-300"
                />
                {selectedIds.size} selected
              </label>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Remove selected
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                Clear selection
              </button>
            </div>
          ) : (
            filteredGuests.length > 0 && (
              <label className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  className="h-3.5 w-3.5 rounded border-gray-300"
                />
                Select all
              </label>
            )
          )}
        </div>
      )}

      <ul className={`divide-y divide-gray-200 border-t border-gray-200 ${guests.length > 0 ? "mt-4" : "mt-8"}`}>
        {guests.length === 0 && (
          <li className="list-none py-4">
            <button
              type="button"
              onClick={() => document.getElementById("fullName")?.focus()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-500 transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
            >
              <span className="text-2xl" aria-hidden="true">
                🎈
              </span>
              <span className="text-sm font-medium">Create your first guest</span>
              <span className="text-xs text-gray-400">Fill in the form above to get started</span>
            </button>
          </li>
        )}
        {guests.length > 0 && filteredGuests.length === 0 && (
          <li className="py-4 text-sm text-gray-500">
            {search ? `No guests match "${search}".` : "No guests match this filter."}
          </li>
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                {editingId !== guest.id && (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(guest.id)}
                    onChange={() => toggleSelected(guest.id)}
                    aria-label={`Select ${guest.full_name}`}
                    className="mt-1 h-3.5 w-3.5 shrink-0 rounded border-gray-300"
                  />
                )}
                <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">Dear {guest.full_name}!</p>
                  <InvitationSentBadge
                    guestId={guest.id}
                    sent={guest.invitation_sent_at != null}
                    channels={guest.sent_channels}
                  />
                  <RsvpStatusBadge status={rsvpStatus} />
                </div>
                <p className="text-xs text-gray-500">
                  {[guest.group_label, guest.email, guest.phone].filter(Boolean).join(" · ")}
                </p>
                </div>
              </div>
              {editingId !== guest.id && (
                <div className="flex flex-wrap items-center gap-3">
                  {guest.site_enabled && (
                    <>
                      <CopyInviteLinkButton guestId={guest.id} slug={eventSlug} inviteCode={guest.invite_code} />
                      <SendInviteMenu
                        guestId={guest.id}
                        guestName={guest.full_name}
                        slug={eventSlug}
                        inviteCode={guest.invite_code}
                        phone={guest.phone}
                        email={guest.email}
                        eventTitle={eventTitle}
                      />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingId(guest.id)}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(guest.id, guest.full_name)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
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

      {pendingRemoval && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-lg"
        >
          <span className="text-gray-700">Removed {pendingRemoval.label}.</span>
          <button
            type="button"
            onClick={handleUndoRemoval}
            className="font-semibold text-[var(--dash-accent)] hover:underline"
          >
            Undo
          </button>
        </div>
      )}

      {addedGuestName && (
        <div
          role="status"
          className={
            "fixed right-6 z-50 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-lg " +
            (pendingRemoval ? "bottom-24" : "bottom-6")
          }
        >
          <span className="text-gray-700">Added {addedGuestName}.</span>
        </div>
      )}
    </div>
  );
}
