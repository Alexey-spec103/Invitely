"use client";

import { useState } from "react";
import Link from "next/link";
import PremiumUpgradeNote from "@/components/paper/PremiumUpgradeNote";
import type { Theme } from "@/lib/themes";
import type { CanvasFrame } from "@/lib/canvas/types";
import type { Locale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionary";

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
  frontCanvas?: CanvasFrame;
  envelopeCanvas?: CanvasFrame;
  programCanvas?: CanvasFrame;
  dressCodeCanvas?: CanvasFrame;
  saveTheDateCanvas?: CanvasFrame;
  thankYouCanvas?: CanvasFrame;
  dressCodeTitle: string;
  dressCodeDescription?: string;
  dressCodeColors: DressCodeColorItem[];
  guests: GuestItem[];
  /** dashboard-audit.md B21: true when the event's plan is below Premium
   * -- personalized (QR-linked, per-guest) invitations are Premium-only in
   * lib/plans.ts. Only applied to the actual per-guest downloads below,
   * never to the plain non-personalized invitation. */
  locked: boolean;
  /** Formats the printed date on every generated PDF (envelope + invitation)
   * -- resolveGuestLocale() in the server-component parent, same source
   * every guest-facing page already reads. Defaults to English inside
   * EnvelopeDocument/InvitationDocument themselves if ever omitted. */
  locale: Locale;
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
  frontCanvas,
  envelopeCanvas,
  programCanvas,
  dressCodeCanvas,
  saveTheDateCanvas,
  thankYouCanvas,
  dressCodeTitle,
  dressCodeDescription,
  dressCodeColors,
  guests,
  locked,
  locale,
}: InvitationDownloadsProps) {
  const t = getDictionary(locale).dashboard.paper;
  const common = getDictionary(locale).dashboard.common;
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<(() => void) | null>(null);
  // Each `generate*` function dynamically imports `@react-pdf/renderer` --
  // a failed chunk load (e.g. a brief network blip) can leave that import's
  // promise cached as rejected by the bundler, so simply re-running the same
  // function keeps failing identically no matter how many times Retry is
  // clicked; only a full page reload clears it. Reset to 0 only at the
  // "fresh attempt" entry points (via `startFresh` below), not inside the
  // generate functions themselves, so the Retry button can increment it.
  const [retryCount, setRetryCount] = useState(0);
  const startFresh = (fn: () => void) => {
    setRetryCount(0);
    fn();
  };

  const hasCanvasDesign = canvasFrames.length > 0;

  const generateCanvasInvitation = async () => {
    setError(null);
    setLastFailedAction(null);
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
      setError(err instanceof Error ? err.message : t.failedToGeneratePdf);
      setLastFailedAction(() => () => void generateCanvasInvitation());
    } finally {
      setPendingId(null);
    }
  };

  const generateProgramCard = async () => {
    setError(null);
    setLastFailedAction(null);
    setPendingId("program");
    try {
      const [{ pdf }, { ProgramCardDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/ProgramCardDocument"),
      ]);
      const blob = await pdf(
        <ProgramCardDocument
          theme={theme}
          title={timelineTitle}
          events={timelineEvents}
          frame={programCanvas}
          locked={locked}
        />
      ).toBlob();
      saveBlob(blob, "program-card.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedToGeneratePdf);
      setLastFailedAction(() => () => void generateProgramCard());
    } finally {
      setPendingId(null);
    }
  };

  const generateDressCodeCard = async () => {
    setError(null);
    setLastFailedAction(null);
    setPendingId("dresscode");
    try {
      const [{ pdf }, { DressCodeCardDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/DressCodeCardDocument"),
      ]);
      const blob = await pdf(
        <DressCodeCardDocument
          theme={theme}
          title={dressCodeTitle || t.seed.dressCodeTitle}
          description={dressCodeDescription}
          colors={dressCodeColors}
          frame={dressCodeCanvas}
          locked={locked}
        />
      ).toBlob();
      saveBlob(blob, "dress-code-card.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedToGeneratePdf);
      setLastFailedAction(() => () => void generateDressCodeCard());
    } finally {
      setPendingId(null);
    }
  };

  const generateEnvelope = async () => {
    setError(null);
    setLastFailedAction(null);
    setPendingId("envelope");
    try {
      const [{ pdf }, { EnvelopeDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/EnvelopeDocument"),
      ]);
      const blob = await pdf(
        <EnvelopeDocument
          theme={theme}
          names={names}
          eventDate={eventDate}
          locale={locale}
          frame={envelopeCanvas}
          locked={locked}
        />
      ).toBlob();
      saveBlob(blob, "envelope.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedToGeneratePdf);
      setLastFailedAction(() => () => void generateEnvelope());
    } finally {
      setPendingId(null);
    }
  };

  const generateSaveTheDateCard = async () => {
    setError(null);
    setLastFailedAction(null);
    setPendingId("savethedate");
    try {
      const [{ pdf }, { SaveTheDateCardDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/SaveTheDateCardDocument"),
      ]);
      const blob = await pdf(
        <SaveTheDateCardDocument
          theme={theme}
          names={names}
          eventDate={eventDate}
          locale={locale}
          frame={saveTheDateCanvas}
          locked={locked}
        />
      ).toBlob();
      saveBlob(blob, "save-the-date.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedToGeneratePdf);
      setLastFailedAction(() => () => void generateSaveTheDateCard());
    } finally {
      setPendingId(null);
    }
  };

  const generateThankYouCard = async () => {
    setError(null);
    setLastFailedAction(null);
    setPendingId("thankyou");
    try {
      const [{ pdf }, { ThankYouCardDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/ThankYouCardDocument"),
      ]);
      const blob = await pdf(
        <ThankYouCardDocument theme={theme} names={names} frame={thankYouCanvas} locked={locked} />
      ).toBlob();
      saveBlob(blob, "thank-you.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedToGeneratePdf);
      setLastFailedAction(() => () => void generateThankYouCard());
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

    // A "Guest's personal invite" QR on a canvas-designed side needs to
    // encode *this* guest's link, not the plain site link -- resolved fresh
    // per guest (resolveCanvasQrElements falls back to the site link when
    // inviteUrl is undefined, i.e. the generic/non-personalized download).
    let backFrame: CanvasFrame | undefined;
    let frontFrame: CanvasFrame | undefined;
    if (backCanvas || frontCanvas) {
      const { resolveCanvasQrElements } = await import("@/lib/canvas/resolveQrElements");
      const framesToResolve = [backCanvas, frontCanvas].filter((f): f is CanvasFrame => Boolean(f));
      const resolved = await resolveCanvasQrElements(framesToResolve, {
        siteUrl: `${window.location.origin}/e/${slug}`,
        inviteUrl,
      });
      let i = 0;
      if (backCanvas) backFrame = resolved[i++];
      if (frontCanvas) frontFrame = resolved[i++];
    }

    return pdfModule
      .pdf(
        <documentModule.InvitationDocument
          theme={theme}
          names={names}
          eventDate={eventDate}
          locale={locale}
          venueName={venueName}
          venueAddress={venueAddress}
          guestName={guest?.fullName}
          qrDataUrl={qrDataUrl}
          backMessage={backMessage}
          backFrame={backFrame}
          frontFrame={frontFrame}
          locked={Boolean(guest) && locked}
        />
      )
      .toBlob();
  };

  const generate = async (guest?: GuestItem) => {
    const id = guest?.id ?? "generic";
    setError(null);
    setLastFailedAction(null);
    setPendingId(id);
    try {
      const [pdfModule, documentModule] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/InvitationDocument"),
      ]);

      const blob = await renderGuestPdf(guest, pdfModule, documentModule);
      saveBlob(blob, guest ? `invitation-${guest.fullName}.pdf` : "invitation.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedToGeneratePdf);
      setLastFailedAction(() => () => void generate(guest));
    } finally {
      setPendingId(null);
    }
  };

  const generateAll = async () => {
    if (guests.length === 0) return;
    setError(null);
    setLastFailedAction(null);
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
      setError(err instanceof Error ? err.message : t.downloads.failedToGeneratePdfs);
      setLastFailedAction(() => () => void generateAll());
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
          onClick={() => startFresh(hasCanvasDesign ? generateCanvasInvitation : () => generate())}
          disabled={pendingId !== null}
          className="dash-btn dash-btn-primary"
        >
          {pendingId === "generic"
            ? t.downloads.generating
            : hasCanvasDesign
              ? t.downloads.custom
              : t.downloads.generic}
        </button>
        <button type="button" onClick={() => startFresh(generateEnvelope)} disabled={pendingId !== null} className="dash-btn dash-btn-neutral">
          {pendingId === "envelope" ? t.downloads.generating : t.downloads.envelope}
        </button>
        {timelineEvents.length > 0 && (
          <button type="button" onClick={() => startFresh(generateProgramCard)} disabled={pendingId !== null} className="dash-btn dash-btn-neutral">
            {pendingId === "program" ? t.downloads.generating : t.downloads.program}
          </button>
        )}
        {dressCodeColors.length > 0 && (
          <button type="button" onClick={() => startFresh(generateDressCodeCard)} disabled={pendingId !== null} className="dash-btn dash-btn-neutral">
            {pendingId === "dresscode" ? t.downloads.generating : t.downloads.dressCode}
          </button>
        )}
        <button type="button" onClick={() => startFresh(generateSaveTheDateCard)} disabled={pendingId !== null} className="dash-btn dash-btn-neutral">
          {pendingId === "savethedate" ? t.downloads.generating : t.downloads.saveTheDate}
        </button>
        <button type="button" onClick={() => startFresh(generateThankYouCard)} disabled={pendingId !== null} className="dash-btn dash-btn-neutral">
          {pendingId === "thankyou" ? t.downloads.generating : t.downloads.thankYou}
        </button>
      </div>

      {error && (
        <p className="mt-3 flex flex-wrap items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <span>{error}</span>
          {lastFailedAction &&
            (retryCount >= 1 ? (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="font-semibold underline underline-offset-2 hover:text-red-900"
              >
                {common.reloadPage}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setRetryCount((n) => n + 1);
                  lastFailedAction();
                }}
                className="font-semibold underline underline-offset-2 hover:text-red-900"
              >
                {common.retry}
              </button>
            ))}
        </p>
      )}

      <div className="mt-8 border-t border-gray-200 pt-6">
        <h2 className="dash-h2 text-lg text-[var(--dash-accent-text)]">{t.downloads.heading}</h2>
        <p className="mt-1 text-sm text-gray-600">
          {t.downloads.description}
          {hasCanvasDesign && t.downloads.canvasNote}
        </p>
        {/* dashboard-audit.md B21: personalized invitations are a
            Premium-tier material in lib/plans.ts -- watermarked (not
            blocked) below that plan, same honest "see it, upgrade to
            remove it" logic as the banquet materials. */}
        {locked && (
          <div className="mt-1">
            <PremiumUpgradeNote eventId={eventId} locale={locale} />
          </div>
        )}

        {guests.length > 0 && (
          <div className="mt-4">
            <button type="button" onClick={() => startFresh(generateAll)} disabled={pendingId !== null} className="dash-btn dash-btn-primary">
              {pendingId === "all"
                ? bulkProgress
                  ? t.downloads.generatingProgress(bulkProgress.done, bulkProgress.total)
                  : t.downloads.generating
                : t.downloads.downloadAllAsZip(guests.length)}
            </button>
          </div>
        )}

        <ul className="mt-4 divide-y divide-gray-200 border-t border-gray-200">
          {guests.length === 0 && (
            <li className="list-none py-4">
              <Link
                href={`/dashboard/${eventId}/guests`}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-600 transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
              >
                <span className="text-2xl" aria-hidden="true">
                  💌
                </span>
                <span className="text-sm font-medium">{t.downloads.noGuestsYet}</span>
                <span className="text-xs text-gray-600">{t.downloads.addGuestsHint}</span>
              </Link>
            </li>
          )}
          {guests.map((guest) => (
            <li key={guest.id} className="flex items-center justify-between py-3">
              <p className="text-sm font-medium text-gray-900">{guest.fullName}</p>
              <button
                type="button"
                onClick={() => startFresh(() => generate(guest))}
                disabled={pendingId !== null}
                className="text-sm font-medium text-gray-600 hover:text-[var(--dash-accent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingId === guest.id ? t.downloads.generating : t.downloads.downloadPdf}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
