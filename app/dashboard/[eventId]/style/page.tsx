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
  const { data: siteConfig } = await supabase
    .from("site_config")
    .select("theme_id")
    .eq("event_id", event.id)
    .maybeSingle();

  return (
    <ThemeSelectForm
      eventId={event.id}
      currentThemeId={siteConfig?.theme_id ?? DEFAULT_THEME_ID}
      name1={event.subtitle_names?.[0] ?? "Partner One"}
      name2={event.subtitle_names?.[1]}
      eventDate={event.event_date}
    />
  );
}
