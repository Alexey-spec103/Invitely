"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateInvitationBackMessage } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import type { Theme } from "@/lib/themes";
import InvitationCardPreview from "@/components/paper/InvitationCardPreview";
import EnvelopeCardPreview from "@/components/paper/EnvelopeCardPreview";
import ProgramCardPreview, { type ProgramCardEvent } from "@/components/paper/ProgramCardPreview";
import DressCodeCardPreview, { type DressCodeCardColor } from "@/components/paper/DressCodeCardPreview";

interface PaperEditorProps {
  eventId: string;
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
}

type SlideId = "invitation" | "envelope" | "program" | "dressCode";

interface Slide {
  id: SlideId;
  label: string;
  aspectRatio: string;
  hasFlip: boolean;
}

const ZOOM_MIN = 0.7;
const ZOOM_MAX = 1.4;
const ZOOM_STEP = 0.15;

export default function PaperEditor({
  eventId,
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
}: PaperEditorProps) {
  const router = useRouter();

  // Extra cards only appear once there's something to show -- mirrors the
  // same conditions InvitationDownloads already uses to show/hide their
  // download buttons, so the preview set and the download set never disagree.
  const slides = useMemo<Slide[]>(() => {
    const list: Slide[] = [
      { id: "invitation", label: "Invitation", aspectRatio: "420 / 595", hasFlip: true },
      { id: "envelope", label: "Envelope", aspectRatio: "649 / 459", hasFlip: false },
    ];
    if (timelineEvents.length > 0) {
      list.push({ id: "program", label: "Program card", aspectRatio: "420 / 595", hasFlip: false });
    }
    if (dressCodeColors.length > 0) {
      list.push({ id: "dressCode", label: "Dress-code card", aspectRatio: "420 / 595", hasFlip: false });
    }
    return list;
  }, [timelineEvents.length, dressCodeColors.length]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [side, setSide] = useState<"front" | "back">("front");
  const [zoom, setZoom] = useState(1);
  const [backMessage, setBackMessage] = useState(initialBackMessage);

  const { state, error } = useAutosave({ backMessage }, async (values) => {
    await updateInvitationBackMessage({ eventId, backMessage: values.backMessage });
    router.refresh();
  });

  const activeSlide = slides[activeIndex] ?? slides[0];

  const goTo = (delta: number) => {
    setActiveIndex((current) => (current + delta + slides.length) % slides.length);
    setSide("front");
  };

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid sm:grid-cols-[minmax(0,240px)_1fr] sm:items-start sm:gap-6">
      <div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => goTo(-1)}
            disabled={slides.length < 2}
            aria-label="Previous card"
            className="rounded-md border border-gray-300 p-1.5 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹
          </button>
          <p className="text-sm font-medium text-gray-900">{activeSlide.label}</p>
          <button
            type="button"
            onClick={() => goTo(1)}
            disabled={slides.length < 2}
            aria-label="Next card"
            className="rounded-md border border-gray-300 p-1.5 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ›
          </button>
        </div>

        <div className="mt-3 flex justify-center overflow-hidden rounded-md bg-gray-50 p-4">
          <div
            className="grid overflow-hidden rounded-md shadow-md transition-[width] duration-200"
            style={{ aspectRatio: activeSlide.aspectRatio, width: `${200 * zoom}px` }}
          >
            {activeSlide.id === "invitation" && (
              <InvitationCardPreview
                theme={theme}
                names={names}
                eventDate={eventDate}
                venueName={venueName}
                venueAddress={venueAddress}
                side={side}
                backMessage={backMessage}
              />
            )}
            {activeSlide.id === "envelope" && (
              <EnvelopeCardPreview theme={theme} names={names} eventDate={eventDate} />
            )}
            {activeSlide.id === "program" && (
              <ProgramCardPreview theme={theme} title={timelineTitle} events={timelineEvents} />
            )}
            {activeSlide.id === "dressCode" && (
              <DressCodeCardPreview
                theme={theme}
                title={dressCodeTitle || "Dress Code"}
                description={dressCodeDescription}
                colors={dressCodeColors}
              />
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
            aria-label="Zoom out"
            className="rounded-md border border-gray-300 px-2.5 py-1 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
            aria-label="Zoom in"
            className="rounded-md border border-gray-300 px-2.5 py-1 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            +
          </button>
          {activeSlide.hasFlip && (
            <button
              type="button"
              onClick={() => setSide((s) => (s === "front" ? "back" : "front"))}
              className="rounded-md border border-gray-300 px-2.5 py-1 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              ↺ Flip to {side === "front" ? "back" : "front"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 sm:mt-0">
        {activeSlide.id === "invitation" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Names, date &amp; venue come from your{" "}
              <Link href={`/dashboard/${eventId}`} className="font-medium text-rose-700 underline underline-offset-2">
                Wedding data
              </Link>
              . Edit them there and this card updates automatically.
            </p>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="backMessage" className="block text-sm font-medium text-gray-700">
                  Back of card message <span className="text-gray-400">(optional)</span>
                </label>
                <AutosaveStatus state={state} error={error} />
              </div>
              <textarea
                id="backMessage"
                rows={4}
                value={backMessage}
                onChange={(e) => setBackMessage(e.target.value)}
                placeholder="A note, a quote, or anything else for the back of your card..."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>
          </div>
        )}
        {activeSlide.id === "envelope" && (
          <p className="text-xs text-gray-500">
            The return address uses the same names &amp; date as your invitation — nothing else to set here.
          </p>
        )}
        {activeSlide.id === "program" && (
          <p className="text-xs text-gray-500">
            Edit your schedule in the{" "}
            <Link href={`/dashboard/${eventId}/site`} className="font-medium text-rose-700 underline underline-offset-2">
              Site tab
            </Link>
            &apos;s Timeline card — changes show up here automatically.
          </p>
        )}
        {activeSlide.id === "dressCode" && (
          <p className="text-xs text-gray-500">
            Edit your palette in the{" "}
            <Link href={`/dashboard/${eventId}/site`} className="font-medium text-rose-700 underline underline-offset-2">
              Site tab
            </Link>
            &apos;s Dress code card — changes show up here automatically.
          </p>
        )}
      </div>
    </div>
  );
}
