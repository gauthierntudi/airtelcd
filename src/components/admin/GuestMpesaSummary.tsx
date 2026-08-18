"use client";

import { CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { VODACOM_MARKET_NAME } from "@/lib/mpesa-visa/constants";
import type { AdminMpesaCardRow } from "@/lib/mpesa-visa/service";
import { formatGuestDate } from "@/lib/guest-types";

type Props = {
  guestId: string;
  adminSecret: string;
};

export function GuestMpesaSummary({ guestId, adminSecret }: Props) {
  const [row, setRow] = useState<AdminMpesaCardRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/admin/mpesa", {
      headers: { "x-admin-secret": adminSecret },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error();
        const match = (data as AdminMpesaCardRow[]).find(
          (r) => r.guestId === guestId,
        );
        if (!cancelled) setRow(match ?? null);
      })
      .catch(() => {
        if (!cancelled) setRow(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [guestId, adminSecret]);

  if (loading) {
    return (
      <p className="mt-4 text-sm text-zinc-500">Chargement M-Pesa…</p>
    );
  }

  if (!row) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-zinc-200 px-4 py-3 text-sm text-zinc-500">
        Aucune Carte Visa M-Pesa pour cet invité.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        <LucideIcon icon={CreditCard} size={14} />
        Carte Visa M-Pesa
      </p>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-400">Numéro</dt>
          <dd className="font-mono text-zinc-600">{row.cardMasked}</dd>
        </div>
        <div>
          <dt className="text-zinc-400">Solde bonus</dt>
          <dd className="text-zinc-600">{row.bonusBalanceUsd.toFixed(2)} USD</dd>
        </div>
        <div>
          <dt className="text-zinc-400">Statut</dt>
          <dd className="text-zinc-600">{row.blocked ? "Bloquée" : "Active"}</dd>
        </div>
        <div>
          <dt className="text-zinc-400">Créée le</dt>
          <dd className="text-zinc-600">{formatGuestDate(row.cardCreatedAt)}</dd>
        </div>
      </dl>
      {row.purchases.length > 0 && (
        <>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Achats {VODACOM_MARKET_NAME}
          </p>
          <ul className="mt-2 space-y-1.5">
            {row.purchases.map((p) => (
              <li
                key={p.id}
                className="flex justify-between text-sm text-zinc-600"
              >
                <span>{p.productName}</span>
                <span className="font-mono text-zinc-500">
                  {p.priceUsd.toFixed(0)} USD
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
