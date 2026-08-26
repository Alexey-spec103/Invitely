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
      <div className="mx-auto max-w-xl px-6 py-10">
        <h1 className="text-xl font-semibold text-gray-900">Canvas editor</h1>
        <p className="mt-2 text-sm text-gray-500">
          Design your site freely — drag text and photos anywhere, pick any font and color.
          This replaces the structured section editor for this event once enabled.
        </p>
        <form action={enableCanvas} className="mt-6">
          <button
            type="submit"
            className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Switch this site to the canvas editor
          </button>
        </form>
      </div>
    );
  }

  const parsedFrames = parseCanvasFrames(siteConfig?.canvas ?? null);
  const frames = parsedFrames.length > 0 ? parsedFrames : [blankFrame];

  return <CanvasEditor eventId={event.id} initialFrames={frames} />;
}
