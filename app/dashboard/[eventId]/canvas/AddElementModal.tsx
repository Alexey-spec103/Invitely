"use client";

import { useEffect } from "react";
import { ImagePlus, Type, Video, X } from "lucide-react";

interface AddElementModalProps {
  open: boolean;
  onClose: () => void;
  onAddText: () => void;
  onAddImage: () => void;
  uploadingImage: boolean;
  onAddVideo: () => void;
  uploadingVideo: boolean;
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
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Add element</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700" title="Close">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              onAddText();
              onClose();
            }}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 text-center hover:border-gray-400 hover:bg-gray-50"
          >
            <Type className="h-6 w-6 text-gray-700" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-900">Text</span>
            <span className="text-xs text-gray-500">A heading, name, or line of copy</span>
          </button>
          <button
            type="button"
            disabled={uploadingImage}
            onClick={() => {
              onAddImage();
              onClose();
            }}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 text-center hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ImagePlus className="h-6 w-6 text-gray-700" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-900">Image</span>
            <span className="text-xs text-gray-500">Upload a photo from your device</span>
          </button>
          <button
            type="button"
            disabled={uploadingVideo}
            onClick={() => {
              onAddVideo();
              onClose();
            }}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 text-center hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Video className="h-6 w-6 text-gray-700" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-900">Video</span>
            <span className="text-xs text-gray-500">Upload a short clip from your device</span>
          </button>
        </div>
      </div>
    </div>
  );
}
