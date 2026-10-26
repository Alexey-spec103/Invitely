"use client";

import { useEffect, useRef } from "react";
import { ImagePlus, QrCode, Type, Video, X } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface AddElementModalProps {
  open: boolean;
  onClose: () => void;
  onAddText: () => void;
  onAddImage: () => void;
  uploadingImage: boolean;
  onAddVideo: () => void;
  uploadingVideo: boolean;
  onAddQr: () => void;
  /** Optional, defaults to English -- callers that already resolve the
   * host's locale (PaperConstructor) pass it through; any other call site
   * keeps working unchanged. Same pattern as components/ui/ModuleCard.tsx. */
  locale?: Locale;
}

/** Replaces the old bare "+Text"/"+Image" toolbar buttons with a small
 * card-grid modal -- matches the "Добавить элемент" pattern observed on
 * weddingpost.ru's own constructor. Text/Image/Video cover everything
 * Invimbo actually supports today (no calendar/block-library entries --
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
  locale,
}: AddElementModalProps) {
  const t = getDictionary(locale ?? "en").dashboard.paper.canvas.addElementModal;
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Accessibility audit: Escape already closed this, but it had no dialog
  // role/aria-modal/aria-labelledby, no focus moved in on open, and no Tab
  // trap -- a keyboard user could tab straight through into the canvas
  // behind it. Mirrors the focus-trap pattern already shipped (and
  // confirmed correct by that same audit) on Plan's anonymous-upgrade
  // modal in PlanSelectForm.tsx.
  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-element-modal-title"
        className="w-full max-w-md rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="add-element-modal-title" className="dash-h2 text-base text-[var(--dash-accent-ink)]">{t.heading}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            title={t.close}
          >
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
            className="flex flex-col items-center gap-2 rounded-lg border border-[var(--dash-border)] p-4 text-center hover:border-[var(--dash-accent)] hover:bg-[var(--dash-hover-tint)]"
          >
            <Type className="h-6 w-6 text-[var(--dash-text-muted)]" aria-hidden="true" />
            <span className="text-sm font-medium text-[var(--dash-text)]">{t.text.label}</span>
            <span className="text-xs text-[var(--dash-text-muted)]">{t.text.body}</span>
          </button>
          <button
            type="button"
            disabled={uploadingImage}
            onClick={() => {
              onAddImage();
              onClose();
            }}
            className="flex flex-col items-center gap-2 rounded-lg border border-[var(--dash-border)] p-4 text-center hover:border-[var(--dash-accent)] hover:bg-[var(--dash-hover-tint)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ImagePlus className="h-6 w-6 text-[var(--dash-text-muted)]" aria-hidden="true" />
            <span className="text-sm font-medium text-[var(--dash-text)]">{t.image.label}</span>
            <span className="text-xs text-[var(--dash-text-muted)]">{t.image.body}</span>
          </button>
          <button
            type="button"
            disabled={uploadingVideo}
            onClick={() => {
              onAddVideo();
              onClose();
            }}
            className="flex flex-col items-center gap-2 rounded-lg border border-[var(--dash-border)] p-4 text-center hover:border-[var(--dash-accent)] hover:bg-[var(--dash-hover-tint)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Video className="h-6 w-6 text-[var(--dash-text-muted)]" aria-hidden="true" />
            <span className="text-sm font-medium text-[var(--dash-text)]">{t.video.label}</span>
            <span className="text-xs text-[var(--dash-text-muted)]">{t.video.body}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onAddQr();
              onClose();
            }}
            className="flex flex-col items-center gap-2 rounded-lg border border-[var(--dash-border)] p-4 text-center hover:border-[var(--dash-accent)] hover:bg-[var(--dash-hover-tint)]"
          >
            <QrCode className="h-6 w-6 text-[var(--dash-text-muted)]" aria-hidden="true" />
            <span className="text-sm font-medium text-[var(--dash-text)]">{t.qr.label}</span>
            <span className="text-xs text-[var(--dash-text-muted)]">{t.qr.body}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
