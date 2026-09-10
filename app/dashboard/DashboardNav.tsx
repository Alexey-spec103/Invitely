"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  StyleRailIcon,
  SiteRailIcon,
  PaperRailIcon,
  GuestsRailIcon,
  InvitationsRailIcon,
  BanquetRailIcon,
} from "@/components/icons/RailIcons";
import { getEventType } from "@/lib/eventTypes";
import { isConstructorRoute } from "@/lib/dashboardChrome";

interface DashboardNavProps {
  eventId: string;
  eventType: string;
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

export default function DashboardNav({ eventId, eventType }: DashboardNavProps) {
  const pathname = usePathname();
  const base = `/dashboard/${eventId}`;
  const isConstructor = isConstructorRoute(pathname, eventId);

  const navItems: { href: string; label: string; icon: ComponentType<{ className?: string }>; accent: keyof typeof ACCENTS }[] = [
    { href: `${base}/style`, label: "Style", icon: StyleRailIcon, accent: "rose" },
    { href: `${base}/site`, label: "Site", icon: SiteRailIcon, accent: "teal" },
    { href: `${base}/paper`, label: "Paper", icon: PaperRailIcon, accent: "pink" },
    { href: `${base}/guests`, label: "Guests", icon: GuestsRailIcon, accent: "violet" },
    { href: `${base}/invitations`, label: "Invitations", icon: InvitationsRailIcon, accent: "amber" },
    { href: `${base}/banquet`, label: getEventType(eventType).seatingLabel, icon: BanquetRailIcon, accent: "indigo" },
  ];

  return (
    <nav
      className={
        isConstructor
          ? "flex flex-row gap-1 overflow-x-auto border-b border-white/10 bg-neutral-950 px-3 py-2 sm:w-48 sm:flex-none sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:py-8"
          : "flex flex-row gap-1 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 sm:w-48 sm:flex-none sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:py-8"
      }
    >
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const accent = ACCENTS[item.accent][isConstructor ? "dark" : "light"];
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? `flex flex-none items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold ${accent.bg} ${accent.text}`
                : isConstructor
                  ? "flex flex-none items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
                  : "flex flex-none items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }
          >
            <Icon className="h-6 w-6 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
