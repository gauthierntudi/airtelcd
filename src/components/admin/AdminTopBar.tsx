"use client";

import { Bell, RefreshCw } from "lucide-react";
import { LucideIcon } from "@/components/ui/lucide-icon";

type Props = {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  loading?: boolean;
};

export function AdminTopBar({ title, subtitle, onRefresh, loading }: Props) {
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c0c0c]/90 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-white/50">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <p className="hidden text-sm text-white/40 sm:block">{today}</p>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-white transition hover:border-vodacom-red/40 hover:bg-[#222] disabled:opacity-50"
            >
              <LucideIcon
                icon={RefreshCw}
                size={16}
                className={loading ? "animate-spin text-vodacom-red" : ""}
              />
              Actualiser
            </button>
          )}

          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#1a1a1a] text-white/40"
            aria-hidden
          >
            <LucideIcon icon={Bell} size={18} />
          </span>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-1.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-vodacom-red text-xs font-bold text-white">
              AD
            </span>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-white">Administrateur</p>
              <p className="text-[10px] text-vodacom-silver">Vodacom Privilège</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
