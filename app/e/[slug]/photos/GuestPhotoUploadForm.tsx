"use client";

import { useRef, useState } from "react";
import { uploadGuestPhoto } from "./actions";

const MAX_DIMENSION = 1400;
const JPEG_QUALITY = 0.85;
const UPLOADER_TOKEN_KEY = "invimbo_guest_photo_uploader_token";

type UploadStatus = "uploading" | "done" | "error";

interface PickedPhoto {
  id: string;
  previewUrl: string;
  status: UploadStatus;
}

/** Resizes+compresses an image file client-side before uploading -- same
 * approach as lib/photoUpload.ts's own resizeImage (duplicated, not
 * imported: that helper is private to a module built around an
 * authenticated host upload, and this is a small enough function that
 * sharing it isn't worth the coupling for one anonymous-guest call site). */
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

/** A random id that identifies this browser/device for the RPC's rate
 * limit (supabase/migrations/20261008140000_guest_photo_album.sql) -- not a
 * guest identity, never shown anywhere, just enough to cap one device's
 * uploads without requiring a name or login. Falls back to a fresh
 * in-memory id (never persisted) if localStorage throws, e.g. in a private
 * browsing mode that blocks it -- uploads still work, they just won't
 * share a rate-limit bucket across a page reload. */
function getUploaderToken(): string {
  try {
    const existing = window.localStorage.getItem(UPLOADER_TOKEN_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    window.localStorage.setItem(UPLOADER_TOKEN_KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

interface GuestPhotoUploadFormProps {
  eventId: string;
  addPhotosLabel: string;
  uploadingLabel: string;
  uploadedLabel: string;
  genericErrorLabel: string;
}

export default function GuestPhotoUploadForm({
  eventId,
  addPhotosLabel,
  uploadingLabel,
  uploadedLabel,
  genericErrorLabel,
}: GuestPhotoUploadFormProps) {
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploaderTokenRef = useRef<string | null>(null);

  const anyUploading = photos.some((photo) => photo.status === "uploading");

  const handleFiles = async (files: FileList) => {
    setErrorMessage(null);
    if (!uploaderTokenRef.current) {
      uploaderTokenRef.current = getUploaderToken();
    }
    const uploaderToken = uploaderTokenRef.current;

    for (const file of Array.from(files)) {
      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, { id, previewUrl, status: "uploading" }]);

      try {
        const resized = await resizeImage(file);
        const formData = new FormData();
        formData.set("file", new File([resized], "photo.jpg", { type: "image/jpeg" }));
        const result = await uploadGuestPhoto(eventId, uploaderToken, formData);
        if (!result.ok) {
          setErrorMessage(genericErrorLabel);
          setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, status: "error" } : photo)));
          continue;
        }
        setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, status: "done" } : photo)));
      } catch {
        setErrorMessage(genericErrorLabel);
        setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, status: "error" } : photo)));
      }
    }
  };

  return (
    <div className="mt-6 flex w-full max-w-sm flex-col items-center gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            void handleFiles(event.target.files);
          }
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={anyUploading}
        className="rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {anyUploading ? uploadingLabel : addPhotosLabel}
      </button>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      {photos.length > 0 && (
        <div className="grid w-full grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
              {/* Local object URL, never re-fetched from Storage -- the
                  guest has no read access to this bucket (see the
                  migration's own comment on why), so this in-memory preview
                  is the only confirmation they ever see of their own photo. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.previewUrl} alt="" className="h-full w-full object-cover" />
              {photo.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
              {photo.status === "done" && (
                <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                  ✓
                </div>
              )}
              {photo.status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/40 text-xs font-semibold text-white">
                  !
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {photos.some((photo) => photo.status === "done") && !anyUploading && (
        <p className="text-sm text-emerald-700">{uploadedLabel}</p>
      )}
    </div>
  );
}
