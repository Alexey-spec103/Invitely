import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/session";
import { getEventById } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_THEME_ID } from "@/lib/themes";
import ThemeSelectForm from "./ThemeSelectForm";

export default async function StylePage({ params }: PageProps<"/dashboard/[eventId]/style">) {
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
  const [{ data: siteConfig }, { data: slots }, { data: history }] = await Promise.all([
    supabase.from("site_config").select("theme_id").eq("event_id", event.id).maybeSingle(),
    supabase.from("theme_slots").select("id, theme_id").eq("event_id", event.id).order("created_at"),
    supabase
      .from("theme_history")
      .select("id, theme_id, changed_at")
      .eq("event_id", event.id)
      .order("changed_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <ThemeSelectForm
      eventId={event.id}
      currentThemeId={siteConfig?.theme_id ?? DEFAULT_THEME_ID}
      name1={event.subtitle_names?.[0] ?? "Partner One"}
      name2={event.subtitle_names?.[1]}
      eventDate={event.event_date}
      slots={slots ?? []}
      history={history ?? []}
    />
  );
}
