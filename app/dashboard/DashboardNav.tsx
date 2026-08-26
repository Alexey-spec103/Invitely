"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getEventType } from "@/lib/eventTypes";

interface DashboardNavProps {
  eventId: string;
  eventType: string;
}

export default function DashboardNav({ eventId, eventType }: DashboardNavProps) {
  const pathname = usePathname();
  const base = `/dashboard/${eventId}`;

  const navItems = [
    { href: base, label: "Overview" },
    { href: `${base}/style`, label: "Style" },
    { href: `${base}/site`, label: "Site" },
    { href: `${base}/guests`, label: "Guests" },
    { href: `${base}/invitations`, label: "Invitations" },
    { href: `${base}/banquet`, label: getEventType(eventType).seatingLabel },
    { href: `${base}/canvas`, label: "Canvas" },
    { href: `${base}/plan`, label: "Plan" },
  ] as const;

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto border-b border-stone-200 bg-white px-3 py-2 sm:w-44 sm:flex-none sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:py-8">
      {navItems.map((item) => {
        const isActive = item.href === base ? pathname === base : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? "flex-none whitespace-nowrap rounded-md border-l-2 border-rose-600 bg-rose-50 px-3.5 py-2 text-sm font-semibold text-rose-700"
                : "flex-none whitespace-nowrap rounded-md border-l-2 border-transparent px-3.5 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
