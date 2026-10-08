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
  /** All five below default to English -- every dashboard call site (always
   * English, by established convention) relies on that default rather than
   * passing these explicitly. Only the onboarding wizard (the one place this
   * component renders somewhere locale-aware) passes real translations --
   * confirmed live, this text was staying English even deep into a fully
   * Russian/German onboarding run otherwise. */
  dropHint?: string;
  busyHint?: string;
  changeLabel?: string;
  removeLabel?: string;
  errorFallback?: string;
}

/** Drag-and-drop (or click-to-browse) photo picker, replacing the old
 * "paste a Photo URL" text field. Shows the current photo as a fading-in
 * preview once set, with a "Change" / "Remove" overlay. */
export default function PhotoDropzone({
  value,
  onChange,
  label = "Add your photo",
  helpText,
  dropHint = "Drag a photo here, or click to browse",
  busyHint = "Adding your photo...",
  changeLabel = "Change photo",
  removeLabel = "Remove",
  errorFallback = "Couldn't add that photo",
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
      setError(err instanceof Error ? err.message : errorFallback);
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
          "group relative mt-1 flex h-56 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition " +
          (isDragging ? "border-rose-400 bg-rose-50" : "border-gray-300 bg-gray-50 hover:border-gray-400")
        }
        style={value ? { backgroundColor: "#111827" } : undefined}
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
              {/* `object-contain`, not `object-cover` -- a management preview's
                  one job is letting the host see what they actually
                  uploaded. `cover` on a portrait photo inside this wide,
                  short (h-56) box hid almost the entire subject behind a
                  sliver of background, with no way to tell from this view
                  alone (confirmed live: a shoulder-and-collar crop of a
                  portrait read as a broken/garbage image, not a cropping
                  choice). The actual published Hero section still frames/
                  fills the photo however that variant's own design calls
                  for -- this only changes the editing-time preview. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="" className="h-full w-full object-contain" />
              {/* Always-visible action bar, not hover-only -- a hidden overlay
                  never appears at all on touch devices, which is how this
                  "Remove" control went missing in practice. */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow transition hover:bg-gray-100"
                >
                  {changeLabel}
                </button>
                <button
                  type="button"
                  onClick={() => onChange(undefined)}
                  className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow transition hover:bg-red-50"
                  aria-label={removeLabel}
                >
                  <X className="h-4 w-4" />
                  {removeLabel}
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
              <span className="text-sm font-medium">{isBusy ? busyHint : dropHint}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {helpText && !error && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
