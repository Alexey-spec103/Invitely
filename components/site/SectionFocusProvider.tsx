"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SectionType } from "@/components/sections/registry";

interface SectionFocusContextValue {
  activeSection: SectionType | null;
  clearActiveSection: () => void;
}

const SectionFocusContext = createContext<SectionFocusContextValue | null>(null);

/** Listens for a click inside the live preview iframe (see
 * SectionEditableOverlay, which posts the message from the public site) and
 * exposes which section was clicked so the matching ModuleCard can open
 * itself and scroll into view. Same-origin only -- validates event.origin
 * before trusting anything in the message. */
export function SectionFocusProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<SectionType | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || typeof data !== "object" || data.type !== "invitely:selectSection") return;
      setActiveSection(data.sectionType as SectionType);
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <SectionFocusContext.Provider value={{ activeSection, clearActiveSection: () => setActiveSection(null) }}>
      {children}
    </SectionFocusContext.Provider>
  );
}

export function useSectionFocus() {
  const ctx = useContext(SectionFocusContext);
  if (!ctx) {
    throw new Error("useSectionFocus must be used within a SectionFocusProvider");
  }
  return ctx;
}
