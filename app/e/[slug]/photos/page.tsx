import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";
import { getDictionary } from "@/lib/i18n/dictionary";
import GuestPhotoUploadForm from "./GuestPhotoUploadForm";

export async function generateMetadata({
  params,
}: PageProps<"/e/[slug]/photos">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Add your photos — ${slug}`, robots: { index: false, follow: false } };
}

/** The shared guest photo album's upload page -- what a guest lands on after
 * scanning the host's QR code (see GuestPhotoGallery.tsx in the dashboard
 * for where that QR comes from). Deliberately plain/neutral styling, not
 * theme-aware, same reasoning as SitePasswordGate.tsx: this is a utility
 * screen a guest sees for a few seconds, not part of the themed invitation
 * itself. No login, matching the RSVP form's own no-account bar. */
export default async function GuestPhotosPage({ params }: PageProps<"/e/[slug]/photos">) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, subtitle_names, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!event) {
    notFound();
  }

  const locale = await resolveGuestLocale();
  const t = getDictionary(locale).guestPhotos;
  const displayName = event.subtitle_names?.filter(Boolean).join(" & ") || event.title;

  if (event.status !== "published") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-5xl">📷</p>
        <h1 className="text-2xl font-semibold text-stone-900">{t.heading}</h1>
        <p className="max-w-sm text-sm text-stone-500">{t.notPublished}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-10 text-center">
      <p className="text-5xl">📷</p>
      <h1 className="mt-3 text-2xl font-semibold text-stone-900">{t.heading}</h1>
      <p className="mt-1 max-w-sm text-sm text-stone-500">{t.subtitle(displayName)}</p>
      <GuestPhotoUploadForm
        eventId={event.id}
        addPhotosLabel={t.addPhotosButton}
        uploadingLabel={t.uploading}
        uploadedLabel={t.uploaded}
        genericErrorLabel={t.genericError}
      />
    </div>
  );
}
