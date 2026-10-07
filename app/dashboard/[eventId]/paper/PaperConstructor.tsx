"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { updateInvitationBackCanvas } from "./actions";
import { getEventType } from "@/lib/eventTypes";
import { getLocalizedEventType } from "@/lib/eventTypesLocalized";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import type { Theme } from "@/lib/themes";
import type { Locale } from "@/lib/i18n/locales";
import { CANVAS_DESIGN_WIDTH, type CanvasElement, type CanvasFrame } from "@/lib/canvas/types";
import CanvasFrameEditor from "@/components/canvas/CanvasFrameEditor";
import InvitationCardPreview from "@/components/paper/InvitationCardPreview";
import EnvelopeCardPreview from "@/components/paper/EnvelopeCardPreview";
import ProgramCardPreview, { type ProgramCardEvent } from "@/components/paper/ProgramCardPreview";
import DressCodeCardPreview, { type DressCodeCardColor } from "@/components/paper/DressCodeCardPreview";
import TableCardPreview from "@/components/paper/TableCardPreview";
import PlaceCardPreview from "@/components/paper/PlaceCardPreview";
import TableNumberCardPreview from "@/components/paper/TableNumberCardPreview";
import PremiumUpgradeNote from "@/components/paper/PremiumUpgradeNote";
import PremiumUpgradeModal from "@/components/ui/PremiumUpgradeModal";
import type { TableCardData } from "@/components/pdf/TableCardDocument";

interface PaperConstructorProps {
  eventId: string;
  eventType: string;
  theme: Theme;
  names: string[];
  eventDate: string;
  venueName?: string;
  venueAddress?: string;
  timelineTitle?: string;
  timelineEvents: ProgramCardEvent[];
  dressCodeTitle: string;
  dressCodeDescription?: string;
  dressCodeColors: DressCodeCardColor[];
  backMessage: string;
  backCanvas?: CanvasFrame;
  tableCardData: TableCardData[];
  tableNames: string[];
  allGuestNames: string[];
  placeCardsFilteredByRsvp: boolean;
  seatingLabel: string;
  /** dashboard-audit.md B21: true when the event's plan is below Premium
   * -- banquet/table-card materials are Premium-only in lib/plans.ts. */
  locked: boolean;
  /** Formats the printed date on the live card previews below, so they match
   * the same locale InvitationDownloads.tsx already formats the real
   * downloaded PDF in -- same resolveGuestLocale() source, passed down from
   * this page's server-component parent. */
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

// A5 page proportions (420 x 595pt, same size CanvasPdfDocument prints canvas
// frames at) expressed at CANVAS_DESIGN_WIDTH so the back canvas editor's
// frame comes out the same physical size as the front card.
const BACK_CANVAS_HEIGHT = Math.round((CANVAS_DESIGN_WIDTH * 595) / 420);

/** First time a host opens the Back canvas editor with no saved design yet,
 * carry their old plain-text back message forward as a single text element
 * rather than silently discarding it. */
function createBackCanvasSeed(backMessage: string): CanvasFrame {
  const elements: CanvasElement[] = [];
  if (backMessage) {
    elements.push({
      id: crypto.randomUUID(),
      type: "text",
      x: 160,
      y: BACK_CANVAS_HEIGHT / 2 - 100,
      width: CANVAS_DESIGN_WIDTH - 320,
      height: 200,
      rotation: 0,
      zIndex: 1,
      text: backMessage,
      fontFamily: "Inter",
      fontSize: 32,
      fontWeight: 400,
      color: "#222222",
      textAlign: "center",
      lineHeight: 1.4,
      letterSpacing: 0,
    });
  }
  return {
    id: crypto.randomUUID(),
    name: "Back",
    width: CANVAS_DESIGN_WIDTH,
    height: BACK_CANVAS_HEIGHT,
    background: { color: "#ffffff" },
    elements,
  };
}

type MediaId =
  | "invitation-front"
  | "invitation-back"
  | "envelope"
  | "program"
  | "dressCode"
  | "seatingChart"
  | "placeCards"
  | "tableNumbers";
type MediaGroup = "Invitation" | "Extras" | "Banquet";

interface MediaItem {
  id: MediaId;
  label: string;
  group: MediaGroup;
  aspectRatio: string;
}

// dashboard-audit.md A9: weddingpost.ru groups its media column into three
// sections -- Приглашение (front/back) / Дополнения / Банкет -- confirmed
// live in Chrome. Банкет maps to План рассадки (table + its guest list),
// Карточка гостей (one card per guest) and Карточка столов (a freestanding
// table-number placard, no guest list) -- same three PDFs the Seating tab's
// own download buttons already produce, just previewable here too.
const GROUP_ORDER: MediaGroup[] = ["Invitation", "Extras", "Banquet"];

const ZOOM_MIN = 0.7;
const ZOOM_MAX = 1.4;
const ZOOM_STEP = 0.15;

export default function PaperConstructor({
  eventId,
  eventType,
  theme,
  names,
  eventDate,
  venueName,
  venueAddress,
  timelineTitle,
  timelineEvents,
  dressCodeTitle,
  dressCodeDescription,
  dressCodeColors,
  backMessage: initialBackMessage,
  backCanvas: initialBackCanvas,
  tableCardData,
  tableNames,
  allGuestNames,
  placeCardsFilteredByRsvp,
  seatingLabel,
  locked,
  locale,
}: PaperConstructorProps) {
  const router = useRouter();

  const media = useMemo<MediaItem[]>(() => {
    const list: MediaItem[] = [
      { id: "invitation-front", label: "Front", group: "Invitation", aspectRatio: "420 / 595" },
      { id: "invitation-back", label: "Back", group: "Invitation", aspectRatio: "420 / 595" },
      { id: "envelope", label: "Envelope", group: "Extras", aspectRatio: "649 / 459" },
    ];
    if (timelineEvents.length > 0) {
      list.push({ id: "program", label: "Program card", group: "Extras", aspectRatio: "420 / 595" });
    }
    if (dressCodeColors.length > 0) {
      list.push({ id: "dressCode", label: "Dress-code card", group: "Extras", aspectRatio: "420 / 595" });
    }
    if (tableCardData.length > 0) {
      list.push({ id: "seatingChart", label: "Seating chart", group: "Banquet", aspectRatio: "420 / 595" });
    }
    if (allGuestNames.length > 0) {
      list.push({ id: "placeCards", label: "Place cards", group: "Banquet", aspectRatio: "252 / 144" });
    }
    if (tableNames.length > 0) {
      list.push({ id: "tableNumbers", label: "Table numbers", group: "Banquet", aspectRatio: "1 / 1" });
    }
    return list;
  }, [timelineEvents.length, dressCodeColors.length, tableCardData.length, allGuestNames.length, tableNames.length]);

  const groupedMedia = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      items: media.filter((item) => item.group === group),
    })).filter(({ items }) => items.length > 0);
  }, [media]);

  const [activeId, setActiveId] = useState<MediaId>("invitation-front");
  const [zoom, setZoom] = useState(1);

  // Small undo/redo history for the back canvas, same shape as the site's
  // own CanvasEditor -- just scoped to this one frame instead of a page array.
  const [canvasHistory, setCanvasHistory] = useState<CanvasFrame[]>([
    initialBackCanvas ?? createBackCanvasSeed(initialBackMessage),
  ]);
  const [canvasHistoryIndex, setCanvasHistoryIndex] = useState(0);
  const backCanvasFrame = canvasHistory[canvasHistoryIndex];

  const updateBackCanvasFrame = (updater: (f: CanvasFrame) => CanvasFrame) => {
    const next = updater(backCanvasFrame);
    setCanvasHistory((prev) => [...prev.slice(0, canvasHistoryIndex + 1), next]);
    setCanvasHistoryIndex((idx) => idx + 1);
  };
  const undoBackCanvas = () => setCanvasHistoryIndex((idx) => Math.max(0, idx - 1));
  const redoBackCanvas = () => setCanvasHistoryIndex((idx) => Math.min(canvasHistory.length - 1, idx + 1));

  const { state: canvasSaveState, error: canvasSaveError } = useAutosave(backCanvasFrame, async (frame) => {
    const result = await updateInvitationBackCanvas({ eventId, frame });
    if (!result.ok) throw new Error(result.message);
    router.refresh();
  });

  const activeMedia = media.find((item) => item.id === activeId) ?? media[0];
  const isBackCanvasActive = activeMedia.id === "invitation-back";

  // Banquet media items preview one representative card at a time (a table's
  // seating card, a guest's place card, a table's number placard) out of
  // however many actually exist, since unlike every other media item there
  // isn't a single design to show -- resets whenever the host switches items.
  const [banquetIndex, setBanquetIndex] = useState(0);
  const selectMedia = (id: MediaId) => {
    setActiveId(id);
    setBanquetIndex(0);
  };
  const banquetCount =
    activeMedia.id === "seatingChart"
      ? tableCardData.length
      : activeMedia.id === "placeCards"
        ? allGuestNames.length
        : activeMedia.id === "tableNumbers"
          ? tableNames.length
          : 0;
  const banquetItemIndex = Math.min(banquetIndex, Math.max(0, banquetCount - 1));

  const [pendingDownload, setPendingDownload] = useState<"seatingChart" | "placeCards" | "tableNumbers" | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  // dashboard-audit.md follow-up: a locked download used to just silently
  // generate a watermarked PDF -- the only "this needs payment" signal was
  // a small caption *below* the button, easy to miss. Now clicking a locked
  // download opens PremiumUpgradeModal first; "Continue with watermark"
  // there is what actually triggers the real download function.
  const [pendingUpgradePrompt, setPendingUpgradePrompt] = useState<
    "seatingChart" | "placeCards" | "tableNumbers" | null
  >(null);

  const downloadSeatingChart = async () => {
    setDownloadError(null);
    setPendingDownload("seatingChart");
    try {
      const [{ pdf }, { TableCardDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/TableCardDocument"),
      ]);
      const blob = await pdf(<TableCardDocument theme={theme} tables={tableCardData} locked={locked} />).toBlob();
      saveBlob(blob, "seating-chart.pdf");
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setPendingDownload(null);
    }
  };

  const downloadPlaceCards = async () => {
    setDownloadError(null);
    setPendingDownload("placeCards");
    try {
      const [{ pdf }, { PlaceCardDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/PlaceCardDocument"),
      ]);
      const blob = await pdf(<PlaceCardDocument theme={theme} guestNames={allGuestNames} locked={locked} />).toBlob();
      saveBlob(blob, "place-cards.pdf");
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setPendingDownload(null);
    }
  };

  const downloadTableNumbers = async () => {
    setDownloadError(null);
    setPendingDownload("tableNumbers");
    try {
      const [{ pdf }, { TableNumberCardDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/TableNumberCardDocument"),
      ]);
      const blob = await pdf(<TableNumberCardDocument theme={theme} tableNames={tableNames} locked={locked} />).toBlob();
      saveBlob(blob, "table-numbers.pdf");
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setPendingDownload(null);
    }
  };

  const downloadActions = {
    seatingChart: downloadSeatingChart,
    placeCards: downloadPlaceCards,
    tableNumbers: downloadTableNumbers,
  } as const;

  const handleDownloadClick = (id: "seatingChart" | "placeCards" | "tableNumbers") => {
    if (locked) {
      setPendingUpgradePrompt(id);
      return;
    }
    downloadActions[id]();
  };

  const upgradePromptCopy: Record<"seatingChart" | "placeCards" | "tableNumbers", string> = {
    seatingChart: "Downloading the seating chart",
    placeCards: "Downloading place cards",
    tableNumbers: "Downloading table numbers",
  };

  return (
    <div
      className={
        isBackCanvasActive
          ? "mt-6 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 sm:flex sm:items-start sm:gap-6"
          : /* Was `[..._minmax(0,240px)_1fr]` -- the middle column (the
             actual print-card preview, capped at 240px) got the SMALLEST
             of the two flexible slots, while the largest (1fr) went to a
             couple lines of "edit this elsewhere" help text. Flagged live:
             "надо бумагу сделать больше... чтобы понятно было и удобно
             было редактировать" (make the paper preview bigger, so it's
             clear and easy to work with). Swapping which column gets 1fr
             (paired with a bigger base render size below) gives the actual
             preview the room, not the caption next to it. */
            "mt-6 rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 sm:grid sm:grid-cols-[minmax(0,160px)_1fr_minmax(0,260px)] sm:items-start sm:gap-6"
      }
    >
      <nav className={isBackCanvasActive ? "flex-none space-y-4 sm:w-40" : "space-y-4"}>
        {groupedMedia.map(({ group, items }) => (
          <div key={group}>
            <p className="dash-h2 px-1 text-xs uppercase tracking-wide text-[var(--dash-accent)]">
              {/* "Banquet" is a stable internal group id (see MediaGroup/
                  GROUP_ORDER above) -- the visible label still needs to
                  adapt per event type, same as the "...tab" hint text
                  elsewhere in this file, or a Graduation/Corporate Event
                  host sees "BANQUET" over their seating cards regardless. */}
              {group === "Banquet" ? seatingLabel : group}
            </p>
            <div className="mt-1 space-y-0.5">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectMedia(item.id)}
                  className={
                    item.id === activeId
                      ? "block w-full rounded-md bg-[var(--dash-accent)] px-2.5 py-1.5 text-left text-sm font-medium text-[var(--dash-accent-contrast)]"
                      : "block w-full rounded-md px-2.5 py-1.5 text-left text-sm text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)]"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {isBackCanvasActive ? (
        <div className="mt-6 min-w-0 flex-1 sm:mt-0">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-[var(--dash-text-muted)]">
              Design the back of your invitation -- add text, photos, or a QR code linking to your site.
            </p>
            <AutosaveStatus state={canvasSaveState} error={canvasSaveError} />
          </div>
          <div className="h-[640px] overflow-hidden rounded-md border border-[var(--dash-border)]">
            <CanvasFrameEditor
              frame={backCanvasFrame}
              onUpdateFrame={updateBackCanvasFrame}
              onUndo={undoBackCanvas}
              canUndo={canvasHistoryIndex > 0}
              onRedo={redoBackCanvas}
              canRedo={canvasHistoryIndex < canvasHistory.length - 1}
            />
          </div>
        </div>
      ) : (
        <>
          <div>
            <div className="flex justify-center overflow-hidden rounded-md bg-[var(--dash-surface-2)] p-4">
              <div
                className="grid w-full max-w-[420px] overflow-hidden rounded-md shadow-md transition-[width] duration-200"
                style={{ aspectRatio: activeMedia.aspectRatio, width: `${320 * zoom}px` }}
              >
                {activeMedia.id === "invitation-front" && (
                  <InvitationCardPreview
                    theme={theme}
                    names={names}
                    eventDate={eventDate}
                    locale={locale}
                    venueName={venueName}
                    venueAddress={venueAddress}
                    side="front"
                  />
                )}
                {activeMedia.id === "envelope" && (
                  <EnvelopeCardPreview theme={theme} names={names} eventDate={eventDate} locale={locale} />
                )}
                {activeMedia.id === "program" && (
                  <ProgramCardPreview theme={theme} title={timelineTitle} events={timelineEvents} />
                )}
                {activeMedia.id === "dressCode" && (
                  <DressCodeCardPreview
                    theme={theme}
                    title={dressCodeTitle || "Dress Code"}
                    description={dressCodeDescription}
                    colors={dressCodeColors}
                  />
                )}
                {activeMedia.id === "seatingChart" && tableCardData[banquetItemIndex] && (
                  <TableCardPreview
                    theme={theme}
                    tableName={tableCardData[banquetItemIndex].name}
                    guestNames={tableCardData[banquetItemIndex].guestNames}
                    locked={locked}
                  />
                )}
                {activeMedia.id === "placeCards" && allGuestNames[banquetItemIndex] && (
                  <PlaceCardPreview theme={theme} guestName={allGuestNames[banquetItemIndex]} locked={locked} />
                )}
                {activeMedia.id === "tableNumbers" && tableNames[banquetItemIndex] && (
                  <TableNumberCardPreview theme={theme} tableName={tableNames[banquetItemIndex]} locked={locked} />
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
                aria-label="Zoom out"
                className="dash-btn dash-btn-neutral px-2.5 py-1 text-sm"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
                aria-label="Zoom in"
                className="dash-btn dash-btn-neutral px-2.5 py-1 text-sm"
              >
                +
              </button>
              {activeMedia.id === "invitation-front" && (
                <button
                  type="button"
                  onClick={() => setActiveId("invitation-back")}
                  className="dash-btn dash-btn-neutral px-2.5 py-1 text-sm"
                >
                  ↺ Flip to back
                </button>
              )}
            </div>

            {banquetCount > 1 && (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-[var(--dash-text-muted)]">
                <button
                  type="button"
                  onClick={() => setBanquetIndex((i) => Math.max(0, i - 1))}
                  disabled={banquetItemIndex === 0}
                  aria-label="Previous"
                  className="dash-btn dash-btn-neutral p-1 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <span>
                  {banquetItemIndex + 1} / {banquetCount}
                </span>
                <button
                  type="button"
                  onClick={() => setBanquetIndex((i) => Math.min(banquetCount - 1, i + 1))}
                  disabled={banquetItemIndex === banquetCount - 1}
                  aria-label="Next"
                  className="dash-btn dash-btn-neutral p-1 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 sm:mt-0">
            {activeMedia.id === "invitation-front" && (
              <p className="text-xs text-[var(--dash-text-muted)]">
                Names, date &amp; venue come from your{" "}
                <Link href={`/dashboard/${eventId}/site#wedding-data-card`} className="font-medium text-[var(--dash-accent)] underline underline-offset-2">
                  {getLocalizedEventType(eventType, locale).label} data
                </Link>
                . Edit them there and this card updates automatically.
              </p>
            )}
            {activeMedia.id === "envelope" && (
              <p className="text-xs text-[var(--dash-text-muted)]">
                The return address uses the same names &amp; date as your invitation — nothing else to set here.
              </p>
            )}
            {activeMedia.id === "program" && (
              <p className="text-xs text-[var(--dash-text-muted)]">
                Edit your schedule in the{" "}
                <Link href={`/dashboard/${eventId}/site`} className="font-medium text-[var(--dash-accent)] underline underline-offset-2">
                  Site tab
                </Link>
                &apos;s Timeline card — changes show up here automatically.
              </p>
            )}
            {activeMedia.id === "dressCode" && (
              <p className="text-xs text-[var(--dash-text-muted)]">
                Edit your palette in the{" "}
                <Link href={`/dashboard/${eventId}/site`} className="font-medium text-[var(--dash-accent)] underline underline-offset-2">
                  Site tab
                </Link>
                &apos;s Dress code card — changes show up here automatically.
              </p>
            )}
            {activeMedia.id === "seatingChart" && (
              <div className="space-y-3">
                <p className="text-xs text-[var(--dash-text-muted)]">
                  One card per table, listing everyone seated there. Manage tables and seating in the{" "}
                  <Link href={`/dashboard/${eventId}/banquet`} className="font-medium text-[var(--dash-accent)] underline underline-offset-2">
                    {seatingLabel} tab
                  </Link>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => handleDownloadClick("seatingChart")}
                  disabled={pendingDownload !== null}
                  className="dash-btn dash-btn-primary"
                >
                  {pendingDownload === "seatingChart" ? "Generating..." : `Download all (${tableCardData.length}) as PDF`}
                </button>
                {locked && <PremiumUpgradeNote eventId={eventId} />}
              </div>
            )}
            {activeMedia.id === "placeCards" && (
              <div className="space-y-3">
                <p className="text-xs text-[var(--dash-text-muted)]">
                  One card per guest, ready to cut.
                  {placeCardsFilteredByRsvp && " Only includes guests who've RSVP'd attending."}
                </p>
                <button
                  type="button"
                  onClick={() => handleDownloadClick("placeCards")}
                  disabled={pendingDownload !== null}
                  className="dash-btn dash-btn-primary"
                >
                  {pendingDownload === "placeCards" ? "Generating..." : `Download all (${allGuestNames.length}) as PDF`}
                </button>
                {locked && <PremiumUpgradeNote eventId={eventId} />}
              </div>
            )}
            {activeMedia.id === "tableNumbers" && (
              <div className="space-y-3">
                <p className="text-xs text-[var(--dash-text-muted)]">
                  A freestanding number card for each table. Manage tables in the{" "}
                  <Link href={`/dashboard/${eventId}/banquet`} className="font-medium text-[var(--dash-accent)] underline underline-offset-2">
                    {seatingLabel} tab
                  </Link>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => handleDownloadClick("tableNumbers")}
                  disabled={pendingDownload !== null}
                  className="dash-btn dash-btn-primary"
                >
                  {pendingDownload === "tableNumbers" ? "Generating..." : `Download all (${tableNames.length}) as PDF`}
                </button>
                {locked && <PremiumUpgradeNote eventId={eventId} />}
              </div>
            )}
            {downloadError && (
              <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{downloadError}</p>
            )}
          </div>
        </>
      )}
      <PremiumUpgradeModal
        open={pendingUpgradePrompt !== null}
        onClose={() => setPendingUpgradePrompt(null)}
        eventId={eventId}
        action={pendingUpgradePrompt ? upgradePromptCopy[pendingUpgradePrompt] : ""}
        canContinueAnyway
        onContinueAnyway={() => {
          if (pendingUpgradePrompt) downloadActions[pendingUpgradePrompt]();
        }}
      />
    </div>
  );
}
