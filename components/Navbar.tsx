"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  ListTree,
  MessageSquareWarning,
  Map as MapIcon,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/case/new", label: "New Case", icon: UserPlus },
  { href: "/leads", label: "Leads", icon: ListTree },
  { href: "/tips", label: "Citizen Tips", icon: MessageSquareWarning },
  { href: "/map", label: "Map Intel", icon: MapIcon },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <aside className="w-full md:w-56 shrink-0 bg-ink-900 border-b md:border-b-0 md:border-r border-ink-600 md:h-screen md:sticky md:top-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-ink-600">
        <ShieldAlert className="h-5 w-5 text-tag" strokeWidth={2.25} />
        <span className="font-display font-bold tracking-tight text-paper text-lg">
          TraceLink
        </span>
      </div>
      <nav className="flex md:flex-col overflow-x-auto md:overflow-visible px-2 py-3 gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded text-sm whitespace-nowrap transition-colors",
                active
                  ? "bg-tag/15 text-tag font-medium"
                  : "text-paper/70 hover:bg-ink-700 hover:text-paper"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden md:block px-5 py-4 mt-auto">
          <p className="label-eyebrow leading-relaxed">
          OSINT news search for active investigations. Leads come from live
          Google News RSS using AI-built queries.
        </p>
      </div>
    </aside>
  );
}
