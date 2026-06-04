"use client";

import { RsvpStatus } from "@prisma/client";
import {
  ArrowUpRight,
  CircleCheck,
  CircleX,
  Clock,
  Percent,
  Users,
} from "lucide-react";
import type { LucideIcon as LucideIconType } from "lucide-react";
import type { GuestRow } from "@/lib/guest-types";
import { LucideIcon } from "@/components/ui/lucide-icon";

export function AdminStats({ guests }: { guests: GuestRow[] }) {
  const total = guests.length;
  const confirmed = guests.filter((g) => g.rsvpStatus === RsvpStatus.CONFIRMED).length;
  const pending = guests.filter((g) => g.rsvpStatus === RsvpStatus.PENDING).length;
  const declined = guests.filter((g) => g.rsvpStatus === RsvpStatus.DECLINED).length;
  const rate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
  const sent = guests.filter((g) => g.invitationSentAt).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        icon={Percent}
        label="Taux de confirmation"
        value={`${rate}%`}
        sub={total > 0 ? `${confirmed} confirmé(s) sur ${total}` : "Aucun invité"}
        featured
      />
      <StatCard icon={Users} label="Total invités" value={total} sub="Base complète" />
      <StatCard icon={CircleCheck} label="Confirmés" value={confirmed} sub="RSVP validé" />
      <StatCard icon={Clock} label="En attente" value={pending} sub="Réponse attendue" />
      <StatCard
        icon={CircleX}
        label="Déclinés"
        value={declined}
        sub={`${sent} invitation(s) envoyée(s)`}
        outline
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  featured,
  outline,
}: {
  icon: LucideIconType;
  label: string;
  value: number | string;
  sub?: string;
  featured?: boolean;
  outline?: boolean;
}) {
  const shell = featured
    ? "border-vodacom-red bg-vodacom-red text-white shadow-lg shadow-vodacom-red/25"
    : outline
      ? "border-white/15 bg-transparent text-white"
      : "border-white/10 bg-[#161616] text-white";

  const labelClass = featured ? "text-white/80" : "text-white/50";
  const subClass = featured ? "text-white/70" : "text-white/40";
  const iconWrap = featured
    ? "bg-white/15 text-white"
    : outline
      ? "bg-white/10 text-white"
      : "bg-white/5 text-white/70";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border p-5 transition hover:border-white/20 ${shell}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconWrap}`}>
          <LucideIcon icon={icon} size={20} />
        </span>
        <LucideIcon
          icon={ArrowUpRight}
          size={16}
          className="text-white/20 opacity-0 transition group-hover:opacity-100"
        />
      </div>
      <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">{value}</p>
      {sub && <p className={`mt-1 text-xs ${subClass}`}>{sub}</p>}
    </article>
  );
}
