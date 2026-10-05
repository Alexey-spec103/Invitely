"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { StyleRailIcon, SiteRailIcon, PaperRailIcon, GuestsRailIcon } from "@/components/icons/RailIcons";
import { isConstructorRoute } from "@/lib/dashboardChrome";

interface DashboardNavProps {
  eventId: string;
}

/** Cell highlight color per item -- dashboard-audit.md B2's illustrated
 * icons already carry their own permanent color (confirmed via the audit:
 * weddingpost.ru's icons don't recolor on active/inactive, only the cell
 * background does), so this only drives the active-cell fill/label text.
 * Two variants each: dashboard-audit.md B4's rail is dark on the constructor
 * screens (Site/Paper/Canvas) and light everywhere else -- the "300" shades
 * that read fine on a near-black rail go invisible on white, so light mode
 * needs its own darker (700) text with a paler (50) fill, not just the same
 * classes on a different background. */
const ACCENTS = {
  rose: { dark: { bg: "bg-rose-500/15", text: "text-rose-300" }, light: { bg: "bg-rose-50", text: "text-rose-700" } },
  teal: { dark: { bg: "bg-teal-500/15", text: "text-teal-300" }, light: { bg: "bg-teal-50", text: "text-teal-700" } },
  violet: { dark: { bg: "bg-violet-500/15", text: "text-violet-300" }, light: { bg: "bg-violet-50", text: "text-violet-700" } },
  amber: { dark: { bg: "bg-amber-500/15", text: "text-amber-300" }, light: { bg: "bg-amber-50", text: "text-amber-700" } },
  pink: { dark: { bg: "bg-pink-500/15", text: "text-pink-300" }, light: { bg: "bg-pink-50", text: "text-pink-700" } },
  indigo: { dark: { bg: "bg-indigo-500/15", text: "text-indigo-300" }, light: { bg: "bg-indigo-50", text: "text-indigo-700" } },
} as const;

export default function DashboardNav({ eventId }: DashboardNavProps) {
  const pathname = usePathname();
  const base = `/dashboard/${eventId}`;
  const isConstructor = isConstructorRoute(pathname, eventId);

  // Direct feedback: Guests/Banquet/Invitations used to be three separate
  // tabs for one connected task (add a guest, seat them, download their
  // card) -- Banquet's assignment UI moved onto Guests directly (its own
  // "Seating" section) and Invitations' downloads moved onto Paper
  // (already the paid/print hub); both old routes now just redirect rather
  // than 404 on an old link.
  const navItems: { href: string; label: string; icon: ComponentType<{ className?: string }>; accent: keyof typeof ACCENTS }[] = [
    { href: `${base}/style`, label: "Style", icon: StyleRailIcon, accent: "rose" },
    { href: `${base}/site`, label: "Site", icon: SiteRailIcon, accent: "teal" },
    { href: `${base}/paper`, label: "Paper", icon: PaperRailIcon, accent: "pink" },
    { href: `${base}/guests`, label: "Guests", icon: GuestsRailIcon, accent: "violet" },
  ];

  return (
    // Direct feedback: wanted this pinned like the header's pay CTA, so a
    // host scrolled deep into a long constructor page (Site especially)
    // doesn't lose the rail entirely -- sticky only at sm+, where this rail
    // is a real left column; on mobile it's a horizontal row already in
    // normal flow at the top of the page, nothing to pin there.
    //
    // Two earlier attempts at this both failed live: putting `sticky`
    // directly on this stretched element (no `self-start`) never actually
    // stuck -- confirmed by scrolling just a little, the six links
    // disappeared instantly instead of staying pinned. Flex items get their
    // height set by `align-items: stretch` before sticky positioning is
    // resolved, and a sticky element whose own box is already as tall as
    // its scroll range leaves it no room to "travel" and stay pinned.
    // Adding `self-start` (the first attempt) fixed the sticking but broke
    // the opposite thing: the element's box shrank to just its own content
    // height, so its background stopped covering the rest of the column,
    // leaving a bare gap of the page's own background below the six items.
    //
    // The actual fix needs two separate elements: an outer one that
    // stretches full height and only carries the background/border (never
    // positioned, so it can't fight the stretch), and an inner one, sized
    // to its own short content, that's the one actually marked `sticky`.
    <nav
      // impeccable critique P2: same instant light<->dark flip as the
      // header above -- `bg-neutral-950`/`bg-white` are genuinely different
      // literal classes (not one custom property), but transition-colors
      // still animates the swap since React keeps this the same <nav> node
      // across the re-render, just with a different className string.
      className={
        isConstructor
          // Raycast design-reference pass: literal canvas hex (not a
          // Tailwind neutral shade) -- matches --dash-bg exactly now that
          // that token was retuned to Raycast's own palette, so the rail
          // and the header/content it sits beside are the same black.
          ? "overflow-x-auto border-b border-white/10 bg-[#07080a] px-3 py-2 transition-colors duration-300 sm:w-48 sm:flex-none sm:overflow-visible sm:border-b-0 sm:border-r sm:py-8"
          : "overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 transition-colors duration-300 sm:w-48 sm:flex-none sm:overflow-visible sm:border-b-0 sm:border-r sm:py-8"
      }
    >
      <div className="flex flex-row gap-1 sm:sticky sm:top-[73px] sm:flex-col">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const accent = ACCENTS[item.accent][isConstructor ? "dark" : "light"];
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? `flex flex-none items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-base font-semibold transition-colors ${accent.bg} ${accent.text}`
                  : isConstructor
                    ? "flex flex-none items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-base font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100"
                    : "flex flex-none items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-base font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              }
            >
              <Icon className="h-7 w-7 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
