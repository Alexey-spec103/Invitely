"use client";

import { useEffect } from "react";
import { ImagePlus, QrCode, Type, Video, X } from "lucide-react";

interface AddElementModalProps {
  open: boolean;
  onClose: () => void;
  onAddText: () => void;
  onAddImage: () => void;
  uploadingImage: boolean;
  onAddVideo: () => void;
  uploadingVideo: boolean;
  onAddQr: () => void;
}

/** Replaces the old bare "+Text"/"+Image" toolbar buttons with a small
 * card-grid modal -- matches the "Добавить элемент" pattern observed on
 * weddingpost.ru's own constructor. Text/Image/Video cover everything
 * Invitely actually supports today (no calendar/block-library entries --
 * a pre-built block library is a separate, larger phase, deferred). The
 * actual add/upload logic is untouched: this only changes how those
 * actions are triggered. */
export default function AddElementModal({
  open,
  onClose,
  onAddText,
  onAddImage,
  uploadingImage,
  onAddVideo,
  uploadingVideo,
  onAddQr,
}: AddElementModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="dash-h2 text-base text-[var(--dash-accent)]">Add element</h2>
          <button type="button" onClick={onClose} className="text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]" title="Close">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              onAddText();
              onClose();
            }}
            className="flex flex-col items-center gap-2 rounded-lg border border-[var(--dash-border)] p-4 text-center hover:border-[var(--dash-accent)] hover:bg-white/5"
          >
            <Type className="h-6 w-6 text-[var(--dash-text-muted)]" aria-hidden="true" />
            <span className="text-sm font-medium text-[var(--dash-text)]">Text</span>
            <span className="text-xs text-[var(--dash-text-muted)]">A heading, name, or line of copy</span>
          </button>
          <button
            type="button"
            disabled={uploadingImage}
            onClick={() => {
              onAddImage();
              onClose();
            }}
            className="flex flex-col items-center gap-2 rounded-lg border border-[var(--dash-border)] p-4 text-center hover:border-[var(--dash-accent)] hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ImagePlus className="h-6 w-6 text-[var(--dash-text-muted)]" aria-hidden="true" />
            <span className="text-sm font-medium text-[var(--dash-text)]">Image</span>
            <span className="text-xs text-[var(--dash-text-muted)]">Upload a photo from your device</span>
          </button>
          <button
            type="button"
            disabled={uploadingVideo}
            onClick={() => {
              onAddVideo();
              onClose();
            }}
            className="flex flex-col items-center gap-2 rounded-lg border border-[var(--dash-border)] p-4 text-center hover:border-[var(--dash-accent)] hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Video className="h-6 w-6 text-[var(--dash-text-muted)]" aria-hidden="true" />
            <span className="text-sm font-medium text-[var(--dash-text)]">Video</span>
            <span className="text-xs text-[var(--dash-text-muted)]">Upload a short clip from your device</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onAddQr();
              onClose();
            }}
            className="flex flex-col items-center gap-2 rounded-lg border border-[var(--dash-border)] p-4 text-center hover:border-[var(--dash-accent)] hover:bg-white/5"
          >
            <QrCode className="h-6 w-6 text-[var(--dash-text-muted)]" aria-hidden="true" />
            <span className="text-sm font-medium text-[var(--dash-text)]">QR code</span>
            <span className="text-xs text-[var(--dash-text-muted)]">Links to your site, or a guest&apos;s invite</span>
          </button>
        </div>
      </div>
    </div>
  );
}
