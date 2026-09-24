"use client";

import { useRef, useState } from "react";
import { Music, Pause, Play, X, Loader2 } from "lucide-react";
import { uploadEventMusic } from "@/lib/musicUpload";

interface MusicDropzoneProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

/** Drag-and-drop (or click-to-browse) background-music picker, replacing
 * the old "paste a hosted audio URL" text-only field -- most hosts don't
 * have an already-hosted MP3 sitting around, which is exactly the
 * "неудобно" (inconvenient) gap flagged live. Modeled on PhotoDropzone's
 * upload/Change/Remove pattern, plus an inline play/pause so a host can
 * confirm their track actually works without leaving the dashboard. The
 * bare URL field stays underneath for anyone who already has a hosted
 * link (Spotify/SoundCloud direct file, etc.) -- upload is just the
 * default path now, not the only one. */
export default function MusicDropzone({ value, onChange }: MusicDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setIsBusy(true);
    try {
      const url = await uploadEventMusic(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add that track");
    } finally {
      setIsBusy(false);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      void audio.play();
    }
    setPlaying(!playing);
  };

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void handleFile(event.dataTransfer.files?.[0]);
        }}
        className={
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-5 text-center transition " +
          (isDragging ? "border-rose-400 bg-rose-50" : "border-gray-300 bg-gray-50 hover:border-gray-400")
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        {value ? (
          <div className="flex w-full flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause preview" : "Play preview"}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-700"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
              </button>
              <span className="text-sm font-medium text-gray-700">Your track</span>
            </div>
            <audio ref={audioRef} src={value} onEnded={() => setPlaying(false)} className="hidden" />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow transition hover:bg-gray-100"
              >
                Change track
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  onChange(undefined);
                }}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow transition hover:bg-red-50"
                aria-label="Remove track"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isBusy}
            className="flex flex-col items-center gap-1.5 text-gray-500"
          >
            {isBusy ? <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" /> : <Music className="h-6 w-6" aria-hidden="true" />}
            <span className="text-sm font-medium">{isBusy ? "Adding your track..." : "Drag an audio file here, or click to browse"}</span>
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <p className="mt-3 text-xs text-gray-500">Already have it hosted somewhere? Paste the link instead:</p>
      <input
        type="text"
        placeholder="https://..."
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-900"
      />
    </div>
  );
}
