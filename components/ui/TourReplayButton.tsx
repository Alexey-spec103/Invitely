"use client";

import { useRef } from "react";
import { Play } from "lucide-react";
import FirstVisitTour, { type TourHandle, type TourStep } from "./FirstVisitTour";

interface TourReplayButtonProps {
  tourId: string;
  steps: TourStep[];
  t: { skip: string; back: string; next: string; gotIt: string };
  /** dashboard.common.replayTourButton -- shared across every tab that
   * pairs a tour with this button. */
  label: string;
}

/** Pairs a page's FirstVisitTour with a persistent button that reopens it --
 * the tour itself only ever shows once per browser (see its own
 * "seen it" flag), so without this a host who skipped it, or just wants a
 * refresher later, has no way back in. Same visual language as Style's
 * HowItWorksButton (Play icon, dash-btn-neutral) so "how this page works"
 * reads as one consistent affordance across tabs, even though the two use
 * different underlying mechanisms (a popover there, a re-triggerable tour
 * here) for historical reasons. */
export default function TourReplayButton({ tourId, steps, t, label }: TourReplayButtonProps) {
  const tourRef = useRef<TourHandle>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => tourRef.current?.replay()}
        className="dash-btn dash-btn-neutral gap-1.5 px-3.5 py-1.5 text-xs"
      >
        <Play className="h-3 w-3 fill-current" aria-hidden="true" />
        {label}
      </button>
      <FirstVisitTour ref={tourRef} tourId={tourId} steps={steps} t={t} />
    </>
  );
}
