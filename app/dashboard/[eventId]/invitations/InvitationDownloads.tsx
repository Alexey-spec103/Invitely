"use client";

import { useState } from "react";
import Link from "next/link";
import PremiumUpgradeNote from "@/components/paper/PremiumUpgradeNote";
import type { Theme } from "@/lib/themes";
import type { CanvasFrame } from "@/lib/canvas/types";

interface GuestItem {
  id: string;
  fullName: string;
  inviteCode: string;
}

interface TimelineEventItem {
  time: string;
  title: string;
  description?: string;
}

interface DressCodeColorItem {
  hex: string;
  label?: string;
}

interface InvitationDownloadsProps {
  eventId: string;
  theme: Theme;
  slug: string;
  names: string[];
  eventDate: string;
  venueName?: string;
  venueAddress?: string;
  timelineTitle?: string;
  timelineEvents: TimelineEventItem[];
  canvasFrames: CanvasFrame[];
  backMessage?: string;
  backCanvas?: CanvasFrame;
  dressCodeTitle: string;
  dressCodeDescription?: string;
  dressCodeColors: DressCodeColorItem[];
  guests: GuestItem[];
  /** dashboard-audit.md B21: true when the event's plan is below Premium
   * -- personalized (QR-linked, per-guest) invitations are Premium-only in
   * lib/plans.ts. Only applied to the actual per-guest downloads below,
   * never to the plain non-personalized invitation. */
  locked: boolean;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function InvitationDownloads({
  eventId,
  theme,
  slug,
  names,
  eventDate,
  venueName,
  venueAddress,
  timelineTitle,
  timelineEvents,
  canvasFrames,
  backMessage,
  backCanvas,
  dressCodeTitle,
  dressCodeDescription,
  dressCodeColors,
  guests,
  locked,
}: InvitationDownloadsProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const hasCanvasDesign = canvasFrames.length > 0;

  const generateCanvasInvitation = async () => {
    setError(null);
    setPendingId("generic");
    try {
      const [{ pdf }, { CanvasPdfDocument }, { resolveCanvasQrElements }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/CanvasPdfDocument"),
        import("@/lib/canvas/resolveQrElements"),
      ]);
      // No specific guest for this generic download -- any "guest's personal
      // invite" QR element falls back to the plain site link, same as
      // resolveCanvasQrElements does when inviteUrl is omitted.
      const resolvedFrames = await resolveCanvasQrElements(canvasFrames, {
        siteUrl: `${window.location.origin}/e/${slug}`,
      });
      const blob = await pdf(<CanvasPdfDocument frames={resolvedFrames} />).toBlob();
      saveBlob(blob, "invitation.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setPendingId(null);
    }
  };

  const generateProgramCard = async () => {
    setError(null);
    setPendingId("program");
    try {
      const [{ pdf }, { ProgramCardDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/ProgramCardDocument"),
      ]);
      const blob = await pdf(
        <ProgramCardDocument theme={theme} title={timelineTitle} events={timelineEvents} />
      ).toBlob();
      saveBlob(blob, "program-card.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setPendingId(null);
    }
  };

  const generateDressCodeCard = async () => {
    setError(null);
    setPendingId("dresscode");
    try {
      const [{ pdf }, { DressCodeCardDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/DressCodeCardDocument"),
      ]);
      const blob = await pdf(
        <DressCodeCardDocument
          theme={theme}
          title={dressCodeTitle || "Dress Code"}
          description={dressCodeDescription}
          colors={dressCodeColors}
        />
      ).toBlob();
      saveBlob(blob, "dress-code-card.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setPendingId(null);
    }
  };

  const generateEnvelope = async () => {
    setError(null);
    setPendingId("envelope");
    try {
      const [{ pdf }, { EnvelopeDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/EnvelopeDocument"),
      ]);
      const blob = await pdf(
        <EnvelopeDocument theme={theme} names={names} eventDate={eventDate} />
      ).toBlob();
      saveBlob(blob, "envelope.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setPendingId(null);
    }
  };

  // Dynamically imported so the (fairly heavy, browser-only) @react-pdf/renderer
  // bundle never loads until a download is actually requested, and never runs
  // during Next's server-side render pass of this client component.
  const renderGuestPdf = async (
    guest: GuestItem | undefined,
    pdfModule: typeof import("@react-pdf/renderer"),
    documentModule: typeof import("@/components/pdf/InvitationDocument")
  ) => {
    const inviteUrl = guest ? `${window.location.origin}/e/${slug}?invite=${guest.inviteCode}` : undefined;

    let qrDataUrl: string | undefined;
    if (guest && inviteUrl) {
      const QRCode = (await import("qrcode")).default;
      qrDataUrl = await QRCode.toDataURL(inviteUrl, { margin: 1, width: 240 });
    }

    // A "Guest's personal invite" QR on the canvas back side needs to
    // encode *this* guest's link, not the plain site link -- resolved fresh
    // per guest (resolveCanvasQrElements falls back to the site link when
    // inviteUrl is undefined, i.e. the generic/non-personalized download).
    let backFrame: CanvasFrame | undefined;
    if (backCanvas) {
      const { resolveCanvasQrElements } = await import("@/lib/canvas/resolveQrElements");
      const [resolved] = await resolveCanvasQrElements([backCanvas], {
        siteUrl: `${window.location.origin}/e/${slug}`,
        inviteUrl,
      });
      backFrame = resolved;
    }

    return pdfModule
      .pdf(
        <documentModule.InvitationDocument
          theme={theme}
          names={names}
          eventDate={eventDate}
          venueName={venueName}
          venueAddress={venueAddress}
          guestName={guest?.fullName}
          qrDataUrl={qrDataUrl}
          backMessage={backMessage}
          backFrame={backFrame}
          locked={Boolean(guest) && locked}
        />
      )
      .toBlob();
  };

  const generate = async (guest?: GuestItem) => {
    const id = guest?.id ?? "generic";
    setError(null);
    setPendingId(id);
    try {
      const [pdfModule, documentModule] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/InvitationDocument"),
      ]);

      const blob = await renderGuestPdf(guest, pdfModule, documentModule);
      saveBlob(blob, guest ? `invitation-${guest.fullName}.pdf` : "invitation.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setPendingId(null);
    }
  };

  const generateAll = async () => {
    if (guests.length === 0) return;
    setError(null);
    setPendingId("all");
    setBulkProgress({ done: 0, total: guests.length });
    try {
      const [pdfModule, documentModule, { default: JSZip }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/InvitationDocument"),
        import("jszip"),
      ]);

      const zip = new JSZip();
      for (const [index, guest] of guests.entries()) {
        const blob = await renderGuestPdf(guest, pdfModule, documentModule);
        zip.file(`invitation-${guest.fullName}.pdf`, blob);
        setBulkProgress({ done: index + 1, total: guests.length });
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveBlob(zipBlob, "invitations.zip");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDFs");
    } finally {
      setPendingId(null);
      setBulkProgress(null);
    }
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={hasCanvasDesign ? generateCanvasInvitation : () => generate()}
          disabled={pendingId !== null}
          className="dash-btn dash-btn-primary"
        >
          {pendingId === "generic"
            ? "Generating..."
            : hasCanvasDesign
              ? "Download invitation (your design)"
              : "Download generic invitation"}
        </button>
        <button type="button" onClick={generateEnvelope} disabled={pendingId !== null} className="dash-btn dash-btn-neutral">
          {pendingId === "envelope" ? "Generating..." : "Download envelope design"}
        </button>
        {timelineEvents.length > 0 && (
          <button type="button" onClick={generateProgramCard} disabled={pendingId !== null} className="dash-btn dash-btn-neutral">
            {pendingId === "program" ? "Generating..." : "Download program card"}
          </button>
        )}
        {dressCodeColors.length > 0 && (
          <button type="button" onClick={generateDressCodeCard} disabled={pendingId !== null} className="dash-btn dash-btn-neutral">
            {pendingId === "dresscode" ? "Generating..." : "Download dress-code card"}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-8 border-t border-gray-200 pt-6">
        <h2 className="dash-h2 text-lg text-[var(--dash-accent-text)]">Personalized invitations</h2>
        <p className="mt-1 text-sm text-gray-500">
          Each includes a QR code that links straight to your site with the guest already
          identified, so their RSVP is automatically matched.
          {hasCanvasDesign &&
            " These use your theme's default layout rather than your custom canvas design — per-guest personalization for canvas designs isn't available yet."}
        </p>
        {/* dashboard-audit.md B21: personalized invitations are a
            Premium-tier material in lib/plans.ts -- watermarked (not
            blocked) below that plan, same honest "see it, upgrade to
            remove it" logic as the banquet materials. */}
        {locked && (
          <div className="mt-1">
            <PremiumUpgradeNote eventId={eventId} />
          </div>
        )}

        {guests.length > 0 && (
          <div className="mt-4">
            <button type="button" onClick={generateAll} disabled={pendingId !== null} className="dash-btn dash-btn-primary">
              {pendingId === "all"
                ? bulkProgress
                  ? `Generating ${bulkProgress.done}/${bulkProgress.total}...`
                  : "Generating..."
                : `Download all (${guests.length}) as ZIP`}
            </button>
          </div>
        )}

        <ul className="mt-4 divide-y divide-gray-200 border-t border-gray-200">
          {guests.length === 0 && (
            <li className="list-none py-4">
              <Link
                href={`/dashboard/${eventId}/guests`}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-500 transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
              >
                <span className="text-2xl" aria-hidden="true">
                  💌
                </span>
                <span className="text-sm font-medium">No guests yet</span>
                <span className="text-xs text-gray-400">Add guests on the Guests tab to download their invitations</span>
              </Link>
            </li>
          )}
          {guests.map((guest) => (
            <li key={guest.id} className="flex items-center justify-between py-3">
              <p className="text-sm font-medium text-gray-900">{guest.fullName}</p>
              <button
                type="button"
                onClick={() => generate(guest)}
                disabled={pendingId !== null}
                className="text-sm font-medium text-gray-500 hover:text-[var(--dash-accent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingId === guest.id ? "Generating..." : "Download"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
