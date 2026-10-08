"use client";

import { useEffect, useState } from "react";
import { listGuestPhotos, deleteGuestPhoto, type GuestPhotoItem } from "./photoActions";

interface GuestPhotoGalleryProps {
  eventId: string;
  eventSlug: string;
}

/** The host's side of the shared guest photo album: a QR code guests scan to
 * add their own photos with no login (app/e/[slug]/photos), and a grid of
 * what's come in so far with a delete action per photo. Lives on the Guests
 * tab since it's fundamentally about what guests contribute, same home as
 * RSVP responses and the guestbook. */
export default function GuestPhotoGallery({ eventId, eventSlug }: GuestPhotoGalleryProps) {
  const [photos, setPhotos] = useState<GuestPhotoItem[] | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    listGuestPhotos(eventId).then(setPhotos);
  }, [eventId]);

  // Built client-side at render time, not server-side -- window.location.origin
  // doesn't exist during SSR, same hydration-mismatch reasoning as
  // DashboardShell's own CopyLinkButton.
  useEffect(() => {
    const uploadUrl = `${window.location.origin}/e/${eventSlug}/photos`;
    import("qrcode").then((QRCode) => {
      QRCode.default.toDataURL(uploadUrl, { margin: 1, width: 240 }).then(setQrDataUrl);
    });
  }, [eventSlug]);

  const handleDelete = async (photoId: string) => {
    setDeletingId(photoId);
    const result = await deleteGuestPhoto(eventId, photoId);
    setDeletingId(null);
    if (result.ok) {
      setPhotos((prev) => (prev ?? []).filter((photo) => photo.id !== photoId));
      setToast("Photo deleted.");
      setTimeout(() => setToast(null), 3000);
    } else {
      setToast(result.message);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="mt-10 border-t border-gray-200 pt-8">
      <h2 className="dash-h2 text-lg text-[var(--dash-accent-text)]">Guest photos</h2>
      <p className="mt-1 text-sm text-gray-500">
        Guests scan this code to add their own photos — no account needed. You can delete any of them below.
      </p>

      <div className="mt-4 flex items-center gap-4 rounded-md border border-gray-200 bg-gray-50 p-4">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="QR code to the guest photo upload page" className="h-24 w-24 flex-none" />
        ) : (
          <div className="h-24 w-24 flex-none animate-pulse rounded bg-gray-200" />
        )}
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-900">Print this on a table card, or share the link</p>
          <p className="mt-1 break-all text-gray-500">{`/e/${eventSlug}/photos`}</p>
        </div>
      </div>

      {photos === null ? (
        <p className="mt-4 text-sm text-gray-400">Loading...</p>
      ) : photos.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No photos from guests yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-md bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                disabled={deletingId === photo.id}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition hover:bg-black/80 disabled:opacity-60 group-hover:opacity-100"
                aria-label="Delete photo"
              >
                {deletingId === photo.id ? "…" : "✕"}
              </button>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 rounded-md bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
