"use server";

import { getAuthedUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export interface GuestPhotoItem {
  id: string;
  url: string;
  createdAt: string;
}

/** Lists an event's guest-uploaded photos as signed URLs (the "guest-photos"
 * bucket is private -- see supabase/migrations/20261008140000_guest_photo_
 * album.sql's own comment on why -- so there's no public getPublicUrl to
 * reach for here). RLS on both guest_photos and storage.objects already
 * restrict this to the event's real owner; getAuthedUser is just the first,
 * cheap check before bothering Supabase at all. */
export async function listGuestPhotos(eventId: string): Promise<GuestPhotoItem[]> {
  const user = await getAuthedUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("guest_photos")
    .select("id, storage_path, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (!rows || rows.length === 0) return [];

  const items = await Promise.all(
    rows.map(async (row) => {
      const { data } = await supabase.storage
        .from("guest-photos")
        .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS);
      return data?.signedUrl ? { id: row.id, url: data.signedUrl, createdAt: row.created_at } : null;
    })
  );

  return items.filter((item): item is GuestPhotoItem => item !== null);
}

export async function deleteGuestPhoto(
  eventId: string,
  photoId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await getAuthedUser();
  if (!user) return { ok: false, message: "Not signed in" };

  const supabase = await createClient();
  const { data: row, error: lookupError } = await supabase
    .from("guest_photos")
    .select("storage_path")
    .eq("id", photoId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (lookupError || !row) {
    return { ok: false, message: "Photo not found" };
  }

  await supabase.storage.from("guest-photos").remove([row.storage_path]);

  const { error: deleteError } = await supabase.from("guest_photos").delete().eq("id", photoId);
  if (deleteError) {
    return { ok: false, message: deleteError.message };
  }

  return { ok: true };
}
