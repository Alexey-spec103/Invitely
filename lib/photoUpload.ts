"use client";

import { createClient } from "@/lib/supabase/client";

const MAX_DIMENSION = 1400;
const JPEG_QUALITY = 0.85;

/** Resizes+compresses an image file client-side (canvas), capping the
 * longest side at MAX_DIMENSION -- keeps both Storage uploads and the
 * localStorage-held pre-signup data URL small regardless of the original
 * photo's size. */
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

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Couldn't read this image"));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function assertImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("That photo is a bit large — try one under 15MB");
  }
}

/** Resizes a photo and returns a compact data URL for local (pre-signup)
 * preview/storage, with no upload -- there's no session yet to scope a
 * Storage path to. */
export async function photoFileToDataUrl(file: File): Promise<string> {
  assertImageFile(file);
  const resized = await resizeImage(file);
  return blobToDataUrl(resized);
}

/** Resizes a photo and uploads it to the "event-photos" Storage bucket
 * under the current user's own folder (required by that bucket's RLS —
 * see supabase/migrations/20260818110000_event_photos_storage.sql), then
 * returns its public URL. */
export async function uploadEventPhoto(file: File): Promise<string> {
  assertImageFile(file);
  const resized = await resizeImage(file);
  return uploadBlobAsEventPhoto(resized);
}

/** Uploads a previously-created data URL (e.g. one saved to
 * pendingOnboarding before the user had a session) to Storage now that
 * they're authenticated, returning its public URL. */
export async function uploadDataUrlAsEventPhoto(dataUrl: string): Promise<string> {
  return uploadBlobAsEventPhoto(dataUrlToBlob(dataUrl));
}

async function uploadBlobAsEventPhoto(blob: Blob): Promise<string> {
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
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("event-photos").getPublicUrl(path);
  return data.publicUrl;
}
