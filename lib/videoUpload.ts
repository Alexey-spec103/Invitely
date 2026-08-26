"use client";

import { createClient } from "@/lib/supabase/client";

const MAX_SIZE = 50 * 1024 * 1024;

function assertVideoFile(file: File) {
  if (!file.type.startsWith("video/")) {
    throw new Error("Please choose a video file");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("That video is a bit large — try a clip under 50MB");
  }
}

/** Uploads a video file to the "event-photos" Storage bucket -- same bucket
 * lib/photoUpload.ts uses for photos, reused here rather than creating a
 * separate bucket + migration: its RLS policies only scope by the
 * `{user_id}/...` path prefix, not by content type, so it already accepts
 * video with zero schema changes. No client-side resizing (unlike photos)
 * -- resizing/transcoding video client-side isn't practical. */
export async function uploadEventVideo(file: File): Promise<string> {
  assertVideoFile(file);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const extension = file.name.split(".").pop() || "mp4";
  const path = `${user.id}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from("event-photos")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("event-photos").getPublicUrl(path);
  return data.publicUrl;
}
