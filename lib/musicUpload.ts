"use client";

import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 15 * 1024 * 1024;

function assertAudioFile(file: File) {
  if (!file.type.startsWith("audio/")) {
    throw new Error("Please choose an audio file");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("That track is a bit large — try one under 15MB");
  }
}

/** Uploads a background-music file to the "event-music" Storage bucket
 * under the current user's own folder (same owner-scoped RLS shape as
 * uploadEventPhoto in lib/photoUpload.ts -- see
 * supabase/migrations/20260924120000_event_music_storage.sql), then returns
 * its public URL. No client-side re-encoding (unlike photos, there's no
 * cheap canvas-based equivalent for audio) -- the 15MB cap alone keeps a
 * typical 3-4 minute MP3 well within bounds. */
export async function uploadEventMusic(file: File): Promise<string> {
  assertAudioFile(file);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "mp3";
  const path = `${user.id}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from("event-music")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("event-music").getPublicUrl(path);
  return data.publicUrl;
}
