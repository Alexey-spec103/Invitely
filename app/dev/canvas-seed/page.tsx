import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthedUser } from "@/lib/session";
import { getEvent } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { applyCanvasSeed, revertToStructured } from "./actions";

/** Phase 7a dev-only harness: flips the current owner's event between
 * structured and canvas layout mode so CanvasRenderer can be verified live
 * before the real editor (Phase 7b) exists. Same throwaway-tooling
 * convention as app/dev/themes. */
export default async function CanvasSeedPage() {
  const user = await getAuthedUser();

  if (!user) {
    redirect("/login");
  }

  const event = await getEvent(user.id);

  if (!event) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const { data: siteConfig } = await supabase
    .from("site_config")
    .select("layout_mode")
    .eq("event_id", event.id)
    .maybeSingle();

  const seedAction = applyCanvasSeed.bind(null, event.id);
  const revertAction = revertToStructured.bind(null, event.id);

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-xl font-semibold text-gray-900">Canvas seed (dev only)</h1>
      <p className="mt-2 text-sm text-gray-500">
        Current layout mode: <strong>{siteConfig?.layout_mode ?? "structured"}</strong>
      </p>

      <div className="mt-6 flex gap-3">
        <form action={seedAction}>
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Apply canvas seed
          </button>
        </form>
        <form action={revertAction}>
          <button
            type="submit"
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Revert to structured
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm">
        <Link href={`/e/${event.slug}`} className="text-rose-600 underline">
          View /e/{event.slug}
        </Link>
      </p>
    </div>
  );
}
