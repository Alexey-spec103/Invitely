"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import type { SectionType } from "@/components/sections/registry";

interface SectionEditableOverlayProps {
  sectionType: SectionType;
  children: ReactNode;
}

// Framing never changes during the page's lifetime, so there's nothing to
// subscribe to -- this only exists to give useSyncExternalStore a way to
// read window.self/window.top on the client while rendering `false` (safe,
// matches the client's first paint) during SSR, avoiding a hydration
// mismatch without calling setState in an effect.
function subscribeNever() {
  return () => {};
}
function getIsFramed() {
  return window.self !== window.top;
}
function getServerIsFramed() {
  return false;
}

/** Wraps one rendered section on the PUBLIC site with a hover/click
 * affordance that posts a "select this section for editing" message to a
 * parent window -- only when actually embedded as the dashboard's preview
 * iframe (same-origin AND framed), never for a real guest visiting the page
 * directly, even if a stray `?preview=1` link leaks. */
export default function SectionEditableOverlay({ sectionType, children }: SectionEditableOverlayProps) {
  const isFramed = useSyncExternalStore(subscribeNever, getIsFramed, getServerIsFramed);

  if (!isFramed) {
    return <>{children}</>;
  }

  const select = () =>
    window.parent.postMessage({ type: "invitely:selectSection", sectionType }, window.location.origin);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={select}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select();
        }
      }}
      className="group relative cursor-pointer outline-offset-[-2px] transition hover:outline hover:outline-2 hover:outline-rose-400"
    >
      {children}
      <span className="pointer-events-none absolute right-2 top-2 rounded bg-rose-500/90 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
        Edit
      </span>
    </div>
  );
}
