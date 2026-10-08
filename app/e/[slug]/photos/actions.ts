"use server";

import { createClient } from "@/lib/supabase/server";

const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

/** Uploads one already-resized guest photo (resizing happens client-side in
 * GuestPhotoUploadForm, same as lib/photoUpload.ts's own resizeImage --
 * duplicated rather than shared since that helper is private to a module
 * built around an authenticated host upload, not this anonymous-guest one)
 * to the "guest-photos" Storage bucket, then records it via the
 * record_guest_photo() RPC (supabase/migrations/20261008140000_guest_photo_
 * album.sql) -- that RPC is where the real access control and rate limit
 * live (event must be published, max 20 photos per device per 24h), not
 * here; the checks in this action are just a fast, friendly first pass. */
export async function uploadGuestPhoto(
  eventId: string,
  uploaderToken: string,
  formData: FormData
): Promise<{ ok: true } | { ok: false; message: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return { ok: false, message: "Please choose an image file" };
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return { ok: false, message: "That photo is a bit large — try one under 8MB" };
  }
  if (!uploaderToken.trim()) {
    return { ok: false, message: "Missing uploader token" };
  }

  const supabase = await createClient();
  const path = `${eventId}/${uploaderToken}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("guest-photos")
    .upload(path, file, { contentType: "image/jpeg", upsert: false });
  if (uploadError) {
    return { ok: false, message: uploadError.message };
  }

  const { error: recordError } = await supabase.rpc("record_guest_photo", {
    p_event_id: eventId,
    p_storage_path: path,
    p_uploader_token: uploaderToken,
  });
  if (recordError) {
    // Best-effort cleanup -- if this fails too, an orphaned object is a far
    // smaller problem than a photo the host can never see or delete.
    await supabase.storage.from("guest-photos").remove([path]);
    return { ok: false, message: recordError.message };
  }

  return { ok: true };
}
