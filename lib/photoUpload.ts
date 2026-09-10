"use client";

import { createClient } from "@/lib/supabase/client";

const MAX_DIMENSION = 1400;
const JPEG_QUALITY = 0.85;

/** Resizes+compresses an image file client-side (canvas) before uploading,
 * capping the longest side at MAX_DIMENSION. */
function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Couldn't process this image"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't process this image"))),
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That doesn't look like a photo we can use"));
    };
    img.src = url;
  });
}

function assertImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("That photo is a bit large — try one under 15MB");
  }
}

/** Resizes a photo and uploads it to the "event-photos" Storage bucket
 * under the current user's own folder (required by that bucket's RLS --
 * see supabase/migrations/20260818110000_event_photos_storage.sql, keyed by
 * auth.uid() so this works identically for an anonymous trial session as
 * for a real account), then returns its public URL. */
export async function uploadEventPhoto(file: File): Promise<string> {
  assertImageFile(file);
  const resized = await resizeImage(file);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const path = `${user.id}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from("event-photos")
    .upload(path, resized, { contentType: "image/jpeg", upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("event-photos").getPublicUrl(path);
  return data.publicUrl;
}
