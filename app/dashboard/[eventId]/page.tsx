import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { getTheme, DEFAULT_THEME_ID } from "@/lib/themes";
import { getWeddingDataCompleteness } from "@/lib/weddingData";
import WeddingDataCard from "./WeddingDataCard";

export default async function HubPage({ params }: PageProps<"/dashboard/[eventId]">) {
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
    .select("theme_id")
    .eq("event_id", event.id)
    .maybeSingle();

  let theme;
  try {
    theme = getTheme(siteConfig?.theme_id ?? DEFAULT_THEME_ID);
  } catch {
    theme = getTheme(DEFAULT_THEME_ID);
  }

  const { percent } = getWeddingDataCompleteness(event);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Overview</h1>
      <p className="mt-1 text-sm text-gray-500">Your progress at a glance — dive into any section below.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="h-9 w-9 shrink-0 rounded-full border border-gray-200"
                style={{ backgroundColor: theme.vars["--theme-accent"] }}
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">Style</p>
                <p className="mt-0.5 text-xs text-gray-500">{theme.name}</p>
              </div>
            </div>
            <Link
              href={`/dashboard/${event.id}/style`}
              className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-900 transition hover:bg-gray-50"
            >
              Change
            </Link>
          </div>
        </div>

        <WeddingDataCard
          eventId={event.id}
          eventType={event.event_type}
          percent={percent}
          defaultValues={{
            name1: event.subtitle_names?.[0] ?? "",
            name2: event.subtitle_names?.[1] ?? "",
            eventDate: event.event_date,
            venueName: event.venue_name ?? "",
            venueCity: event.venue_city ?? "",
            venueAddress: event.venue_address ?? "",
          }}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link
          href={`/dashboard/${event.id}/site`}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300"
        >
          <p className="text-sm font-semibold text-gray-900">🌐 Site</p>
          <p className="mt-1 text-xs text-gray-500">Edit sections, modules & layout for your live site.</p>
        </Link>
        <Link
          href={`/dashboard/${event.id}/invitations`}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300"
        >
          <p className="text-sm font-semibold text-gray-900">🖨️ Paper invitations</p>
          <p className="mt-1 text-xs text-gray-500">Download a print-ready PDF invitation set.</p>
        </Link>
      </div>
    </div>
  );
}
