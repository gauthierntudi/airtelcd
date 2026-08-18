"use client";

import {
  Activity,
  Calendar,
  Home,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { VodacomIcon } from "@/components/branding/VodacomIcon";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  {
    href: "/admin/events",
    label: "Événements",
    icon: Calendar,
    exact: false,
  },
  {
    href: "/admin/messages",
    label: "Messages",
    icon: MessageCircle,
    exact: true,
  },
  { href: "/admin/status", label: "Statut système", icon: Activity, exact: true },
  { href: "/", label: "Accueil plateforme", icon: Home, exact: false },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-zinc-200 bg-white text-zinc-900 lg:flex">
      <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-5">
        <VodacomIcon href="/admin" size={40} priority />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Airtel RSVP
          </p>
          <p className="truncate text-sm font-bold">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navigation admin">
        {NAV.map(({ href, label, icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href) && href !== "/";
          const isHome = href === "/";
          const isActive = isHome ? pathname === "/" : active;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-vodacom-red text-white shadow-lg shadow-vodacom-red/20"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <LucideIcon icon={icon} size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
