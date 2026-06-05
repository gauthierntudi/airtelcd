"use client";

import { Activity, CreditCard, Home, LayoutDashboard, Mail } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { VodacomIcon } from "@/components/branding/VodacomIcon";
import { EVENT } from "@/lib/event";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  {
    href: "/admin/mpesa",
    label: "M-Pesa & Carrefour",
    icon: CreditCard,
    exact: true,
  },
  { href: "/admin/status", label: "Statut système", icon: Activity, exact: true },
  { href: "/", label: "Accueil plateforme", icon: Home, exact: false },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-white/10 bg-[#080808] text-white lg:flex">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <VodacomIcon href="/admin" size={40} priority />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-vodacom-silver">
            Privilège
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
                  : "text-vodacom-silver hover:bg-white/10 hover:text-white"
              }`}
            >
              <LucideIcon icon={icon} size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl border border-vodacom-red/30 bg-vodacom-red/15 p-4">
          <div className="mb-2 flex items-center gap-2 text-vodacom-red">
            <LucideIcon icon={Mail} size={16} />
            <span className="text-xs font-bold uppercase tracking-wide text-white">Invitations</span>
          </div>
          <p className="text-xs leading-relaxed text-white/70">{EVENT.title}</p>
        </div>
      </div>
    </aside>
  );
}
