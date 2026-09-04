import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { CANVAS_DESIGN_WIDTH, type CanvasFrame } from "@/lib/canvas/types";
import { parseCanvasFrames } from "@/lib/canvas/parse";
import CanvasEditor from "./CanvasEditor";
import { setLayoutMode } from "./actions";

const blankFrame: CanvasFrame = {
  id: "frame-1",
  name: "Page 1",
  width: CANVAS_DESIGN_WIDTH,
  height: 800,
  background: { color: "#ffffff" },
  elements: [],
};

export default async function CanvasPage({ params }: PageProps<"/dashboard/[eventId]/canvas">) {
  const { eventId } = await params;
  const user = await getAuthedUser();

  if (!user) {
    redirect("/login");
  }

  const event = await getEventById(eventId, user.id);

  if (!event) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: siteConfig } = await supabase
    .from("site_config")
    .select("layout_mode, canvas")
    .eq("event_id", event.id)
    .maybeSingle();

  const layoutMode = siteConfig?.layout_mode ?? "structured";

  if (layoutMode !== "canvas") {
    const enableCanvas = setLayoutMode.bind(null, event.id, "canvas");
    return (
      <div className="-mx-4 -my-6 flex min-h-[calc(100vh-73px)] items-center justify-center bg-[var(--dash-bg)] px-4 py-6 sm:-mx-10 sm:-my-10 sm:px-10 sm:py-10">
        <div className="mx-auto max-w-xl">
          <h1 className="dash-h1 text-[var(--dash-text)]">Canvas editor</h1>
          <p className="mt-2 text-sm text-[var(--dash-text-muted)]">
            Design your site freely — drag text and photos anywhere, pick any font and color.
            This replaces the structured section editor for this event once enabled.
          </p>
          <form action={enableCanvas} className="mt-6">
            <button
              type="submit"
              className="rounded-md bg-[var(--dash-accent)] px-4 py-2 text-sm font-semibold text-[var(--dash-accent-contrast)] hover:bg-[var(--dash-accent-hover)]"
            >
              Switch this site to the canvas editor
            </button>
          </form>
        </div>
      </div>
    );
  }

  const parsedFrames = parseCanvasFrames(siteConfig?.canvas ?? null);
  const frames = parsedFrames.length > 0 ? parsedFrames : [blankFrame];

  return (
    <div className="-mx-4 -my-6 sm:-mx-10 sm:-my-10">
      <CanvasEditor eventId={event.id} initialFrames={frames} />
    </div>
  );
}
