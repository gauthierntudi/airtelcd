"use client";

import { RsvpStatus } from "@prisma/client";
import { AdminPanel, ProgressBar, StatTile } from "@/components/admin/AdminPanel";
import { RSVP_CONFIG, type GuestRow } from "@/lib/guest-types";

type Props = {
  guests: GuestRow[];
};

export function AdminRsvpChart({ guests }: Props) {
  const total = guests.length;
  const confirmed = guests.filter((g) => g.rsvpStatus === RsvpStatus.CONFIRMED).length;
  const pending = guests.filter((g) => g.rsvpStatus === RsvpStatus.PENDING).length;
  const declined = guests.filter((g) => g.rsvpStatus === RsvpStatus.DECLINED).length;

  const segments = [
    {
      label: RSVP_CONFIG.CONFIRMED.label,
      count: confirmed,
      bar: "bg-vodacom-red",
      width: total > 0 ? (confirmed / total) * 100 : 0,
    },
    {
      label: RSVP_CONFIG.PENDING.label,
      count: pending,
      bar: "bg-white",
      width: total > 0 ? (pending / total) * 100 : 0,
    },
    {
      label: RSVP_CONFIG.DECLINED.label,
      count: declined,
      bar: "bg-vodacom-silver",
      width: total > 0 ? (declined / total) * 100 : 0,
    },
  ];

  return (
    <AdminPanel
      title="Répartition RSVP"
      description={`Statut des réponses · ${total} invité${total !== 1 ? "s" : ""}`}
      badge="En direct"
    >
      {total === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-white/40">
          Aucune donnée RSVP
        </p>
      ) : (
        <>
          <ProgressBar
            segments={segments.map((s) => ({
              label: s.label,
              className: s.bar,
              width: s.width,
            }))}
          />
          <ul className="mt-auto grid flex-1 grid-cols-3 gap-3">
            {segments.map((s) => {
              const pct = Math.round(s.width);
              return (
                <StatTile
                  key={s.label}
                  label={s.label}
                  value={s.count}
                  sub={`${pct}%`}
                  dotClass={s.bar}
                />
              );
            })}
          </ul>
        </>
      )}
    </AdminPanel>
  );
}
