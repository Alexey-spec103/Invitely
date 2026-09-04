"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Globe,
  Users,
  Mail,
  UtensilsCrossed,
  LayoutTemplate,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { getEventType } from "@/lib/eventTypes";

interface DashboardNavProps {
  eventId: string;
  eventType: string;
}

/** Each item carries its own accent color -- weddingpost.ru's rail uses a
 * distinct saturated color per icon rather than one uniform active-state
 * color, so the rail reads as colorful/branded rather than a plain list. */
const ACCENTS = {
  rose: { icon: "text-rose-400", activeBg: "bg-rose-500/15", activeText: "text-rose-300" },
  teal: { icon: "text-teal-400", activeBg: "bg-teal-500/15", activeText: "text-teal-300" },
  violet: { icon: "text-violet-400", activeBg: "bg-violet-500/15", activeText: "text-violet-300" },
  amber: { icon: "text-amber-400", activeBg: "bg-amber-500/15", activeText: "text-amber-300" },
  indigo: { icon: "text-indigo-400", activeBg: "bg-indigo-500/15", activeText: "text-indigo-300" },
  slate: { icon: "text-slate-400", activeBg: "bg-slate-500/15", activeText: "text-slate-300" },
} as const;

export default function DashboardNav({ eventId, eventType }: DashboardNavProps) {
  const pathname = usePathname();
  const base = `/dashboard/${eventId}`;

  const navItems: { href: string; label: string; icon: LucideIcon; accent: keyof typeof ACCENTS }[] = [
    { href: `${base}/style`, label: "Style", icon: Sparkles, accent: "rose" },
    { href: `${base}/site`, label: "Site", icon: Globe, accent: "teal" },
    { href: `${base}/guests`, label: "Guests", icon: Users, accent: "violet" },
    { href: `${base}/invitations`, label: "Invitations", icon: Mail, accent: "amber" },
    { href: `${base}/banquet`, label: getEventType(eventType).seatingLabel, icon: UtensilsCrossed, accent: "teal" },
    { href: `${base}/canvas`, label: "Canvas", icon: LayoutTemplate, accent: "indigo" },
    { href: `${base}/plan`, label: "Plan", icon: CreditCard, accent: "slate" },
  ];

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto border-b border-white/10 bg-neutral-950 px-3 py-2 sm:w-48 sm:flex-none sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:py-8">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const accent = ACCENTS[item.accent];
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? `flex flex-none items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold ${accent.activeBg} ${accent.activeText}`
                : "flex flex-none items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
            }
          >
            <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? accent.icon : "text-current"}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
