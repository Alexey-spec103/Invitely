"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { uploadEventPhoto } from "@/lib/photoUpload";

interface PhotoDropzoneProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
  helpText?: string;
}

/** Drag-and-drop (or click-to-browse) photo picker, replacing the old
 * "paste a Photo URL" text field. Shows the current photo as a fading-in
 * preview once set, with a "Change" / "Remove" overlay. */
export default function PhotoDropzone({
  value,
  onChange,
  label = "Add your photo",
  helpText,
}: PhotoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setIsBusy(true);
    try {
      const url = await uploadEventPhoto(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add that photo");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div>
      {label && <p className="block text-sm font-medium text-gray-700">{label}</p>}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={
          "relative mt-1 flex h-40 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition " +
          (isDragging ? "border-rose-400 bg-rose-50" : "border-gray-300 bg-gray-50 hover:border-gray-400")
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />

        <AnimatePresence mode="wait">
          {value ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition hover:bg-black/40 hover:opacity-100">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 transition hover:bg-white"
                >
                  Change photo
                </button>
                <button
                  type="button"
                  onClick={() => onChange(undefined)}
                  className="rounded-full bg-white/90 p-1.5 text-gray-900 transition hover:bg-white"
                  aria-label="Remove photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="empty"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => inputRef.current?.click()}
              disabled={isBusy}
              className="flex flex-col items-center gap-1.5 text-gray-500"
            >
              {isBusy ? (
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="h-6 w-6" aria-hidden="true" />
              )}
              <span className="text-sm font-medium">
                {isBusy ? "Adding your photo..." : "Drag a photo here, or click to browse"}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {helpText && !error && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
