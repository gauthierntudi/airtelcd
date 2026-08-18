"use client";

import {
  ArrowUpRight,
  Ban,
  CircleCheck,
  CreditCard,
  DollarSign,
  Search,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import type { LucideIcon as LucideIconType } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPanel, ProgressBar, StatTile } from "@/components/admin/AdminPanel";
import { LucideIcon } from "@/components/ui/lucide-icon";
import type { AdminMpesaCardRow } from "@/lib/mpesa-visa/service";
import {
  VODACOM_MARKET_NAME,
  CARREFOUR_PRODUCTS,
  MPESA_VISA_WELCOME_BONUS_USD,
} from "@/lib/mpesa-visa/constants";
import { formatGuestDate } from "@/lib/guest-types";
import { notify } from "@/lib/toast";

type Props = {
  adminSecret: string;
  refreshKey?: number;
  onLoadingChange?: (loading: boolean) => void;
};

type PurchaseRow = AdminMpesaCardRow["purchases"][number] & {
  guestName: string;
};

export function AdminMpesaPanel({
  adminSecret,
  refreshKey = 0,
  onLoadingChange,
}: Props) {
  const [rows, setRows] = useState<AdminMpesaCardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    onLoadingChange?.(true);
    try {
      const res = await fetch("/api/admin/mpesa", {
        headers: { "x-admin-secret": adminSecret },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setRows(data);
    } catch {
      notify.error("Impossible de charger M-Pesa");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }, [adminSecret, onLoadingChange]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const metrics = useMemo(() => {
    const totalBonusRemaining = rows.reduce((s, r) => s + r.bonusBalanceUsd, 0);
    const totalSpent = rows.reduce((s, r) => s + r.totalSpentUsd, 0);
    const totalPurchases = rows.reduce((s, r) => s + r.purchases.length, 0);
    const blocked = rows.filter((r) => r.blocked).length;
    const bonusIssued = rows.length * MPESA_VISA_WELCOME_BONUS_USD;
    const bonusUsedPct =
      bonusIssued > 0 ? Math.round((totalSpent / bonusIssued) * 100) : 0;

    const productCounts = CARREFOUR_PRODUCTS.map((p) => ({
      ...p,
      count: rows.reduce(
        (n, r) => n + r.purchases.filter((x) => x.productId === p.id).length,
        0,
      ),
    }));

    const recentPurchases: PurchaseRow[] = rows
      .flatMap((r) =>
        r.purchases.map((p) => ({ ...p, guestName: r.guestName })),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 8);

    return {
      totalBonusRemaining,
      totalSpent,
      totalPurchases,
      blocked,
      bonusIssued,
      bonusUsedPct,
      productCounts,
      recentPurchases,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.guestName.toLowerCase().includes(q) ||
        (r.guestEmail?.toLowerCase().includes(q) ?? false) ||
        r.cardMasked.toLowerCase().includes(q) ||
        r.cardLastFour.includes(q),
    );
  }, [rows, search]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          icon={CreditCard}
          label="Cartes actives"
          value={rows.length}
          sub="Invités avec Visa M-Pesa"
          featured
        />
        <KpiCard
          icon={Wallet}
          label="Bonus restant"
          value={`${metrics.totalBonusRemaining.toFixed(0)} $`}
          sub={`Initial ${MPESA_VISA_WELCOME_BONUS_USD} USD / carte`}
        />
        <KpiCard
          icon={DollarSign}
          label="Total dépensé"
          value={`${metrics.totalSpent.toFixed(0)} $`}
          sub="Achats M-pesa Mall cumulés"
        />
        <KpiCard
          icon={ShoppingBag}
          label="Transactions"
          value={metrics.totalPurchases}
          sub={VODACOM_MARKET_NAME}
        />
        <KpiCard
          icon={Ban}
          label="Cartes bloquées"
          value={metrics.blocked}
          sub={metrics.blocked === 0 ? "Toutes actives" : "À surveiller"}
          outline
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
        <div className="space-y-4 xl:col-span-8">
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  Registre des cartes Visa
                </h2>
                <p className="mt-0.5 text-sm text-zinc-500">
                  Une carte par invité connecté via OTP
                </p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <LucideIcon
                  icon={Search}
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher invité, e-mail, carte…"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-vodacom-red/50 focus:outline-none focus:ring-1 focus:ring-vodacom-red/30"
                />
              </div>
            </div>

            {loading ? (
              <TableSkeleton />
            ) : filtered.length === 0 ? (
              <EmptyState hasData={rows.length > 0} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      <th className="px-5 py-3">Invité</th>
                      <th className="px-4 py-3">Carte</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3 text-right">Solde</th>
                      <th className="px-4 py-3 text-right">Dépensé</th>
                      <th className="px-4 py-3 text-center">Achats</th>
                      <th className="px-5 py-3">Créée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => {
                      const open = expandedId === row.cardId;
                      return (
                        <CardTableGroup
                          key={row.cardId}
                          row={row}
                          open={open}
                          onToggle={() =>
                            setExpandedId(open ? null : row.cardId)
                          }
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <p className="border-t border-zinc-200 px-5 py-3 text-xs text-zinc-400">
                {filtered.length} carte{filtered.length !== 1 ? "s" : ""}
                {search.trim() ? ` (filtré sur ${rows.length})` : ""}
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <AdminPanel
            title="Utilisation du bonus"
            description={`Bonus de bienvenue ${MPESA_VISA_WELCOME_BONUS_USD} USD par carte`}
            badge={`${metrics.bonusUsedPct}% utilisé`}
          >
            <ProgressBar
              segments={[
                {
                  width: metrics.bonusUsedPct,
                  className: "bg-vodacom-red",
                  label: "Utilisé",
                },
                {
                  width: 100 - metrics.bonusUsedPct,
                  className: "bg-emerald-500/80",
                  label: "Disponible",
                },
              ]}
            />
            <ul className="grid grid-cols-2 gap-3">
              <StatTile
                label="Bonus émis"
                value={`${metrics.bonusIssued} $`}
                dotClass="bg-zinc-300"
              />
              <StatTile
                label="Encore disponible"
                value={`${metrics.totalBonusRemaining.toFixed(0)} $`}
                dotClass="bg-emerald-500"
                highlight
              />
            </ul>
          </AdminPanel>

          <AdminPanel
            title="Catalogue M-pesa Mall"
            description="Catalogue boutique M-pesa Mall (accueil)"
          >
            <ul className="space-y-2">
              {metrics.productCounts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                >
                  <div className="min-w-0 pr-3">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {p.name}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {p.count} vente{p.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-vodacom-red/15 px-2.5 py-1 font-mono text-sm font-bold text-vodacom-red">
                    {p.priceUsd} $
                  </span>
                </li>
              ))}
            </ul>
          </AdminPanel>

          <AdminPanel
            title="Derniers achats"
            description="Activité récente sur la plateforme"
            badge={
              metrics.recentPurchases.length > 0
                ? `${metrics.totalPurchases} au total`
                : undefined
            }
          >
            {metrics.recentPurchases.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucun achat enregistré.</p>
            ) : (
              <ul className="space-y-2">
                {metrics.recentPurchases.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug text-zinc-900">
                        {p.productName}
                      </p>
                      <span className="shrink-0 font-mono text-xs font-bold text-vodacom-red">
                        {p.priceUsd.toFixed(0)} $
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {p.guestName} · {formatGuestDate(p.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>
        </aside>
      </div>
    </div>
  );
}

function CardTableGroup({
  row,
  open,
  onToggle,
}: {
  row: AdminMpesaCardRow;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={`cursor-pointer border-b border-zinc-100 transition hover:bg-zinc-50 ${
          open ? "bg-zinc-50" : ""
        }`}
        onClick={onToggle}
      >
        <td className="px-5 py-3.5">
          <p className="font-semibold text-zinc-900">{row.guestName}</p>
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {row.guestEmail ?? row.guestPhone ?? "—"}
          </p>
        </td>
        <td className="px-4 py-3.5">
          <p className="font-mono text-xs text-zinc-600">{row.cardMasked}</p>
          <p className="mt-0.5 text-[10px] text-zinc-400">
            ···· {row.cardLastFour}
          </p>
        </td>
        <td className="px-4 py-3.5">
          <StatusBadge blocked={row.blocked} />
        </td>
        <td className="px-4 py-3.5 text-right font-mono tabular-nums text-emerald-700">
          {row.bonusBalanceUsd.toFixed(2)} $
        </td>
        <td className="px-4 py-3.5 text-right font-mono tabular-nums text-zinc-600">
          {row.totalSpentUsd.toFixed(0)} $
        </td>
        <td className="px-4 py-3.5 text-center">
          <span className="inline-flex min-w-[2rem] justify-center rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
            {row.purchases.length}
          </span>
        </td>
        <td className="px-5 py-3.5 text-xs text-zinc-500">
          {formatGuestDate(row.cardCreatedAt)}
        </td>
      </tr>
      {open && (
        <tr className="border-b border-zinc-200 bg-white">
          <td colSpan={7} className="px-5 py-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Coordonnées invité
                </p>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <Field label="E-mail" value={row.guestEmail ?? "—"} />
                  <Field label="Téléphone" value={row.guestPhone ?? "—"} />
                  <Field
                    label="Expiration"
                    value={row.expiryDisplay}
                  />
                  <Field label="Création carte" value={formatGuestDate(row.cardCreatedAt)} />
                </dl>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <LucideIcon icon={ShoppingBag} size={12} />
                  Historique {VODACOM_MARKET_NAME}
                </p>
                {row.purchases.length === 0 ? (
                  <p className="mt-3 text-sm text-zinc-500">
                    Aucun achat pour cet invité.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {row.purchases.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2"
                      >
                        <span className="text-sm text-zinc-700">
                          {p.productName}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">
                          {p.priceUsd.toFixed(0)} $ ·{" "}
                          {formatGuestDate(p.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function KpiCard({
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
      ? "border-zinc-200 bg-transparent text-zinc-900"
      : "border-zinc-200 bg-white text-zinc-900";

  const labelClass = featured ? "text-white/85" : "text-zinc-500";
  const subClass = featured ? "text-white/80" : "text-zinc-400";
  const iconWrap = featured
    ? "bg-white/20 text-white"
    : outline
      ? "bg-zinc-100 text-zinc-700"
      : "bg-zinc-100 text-zinc-600";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border p-5 transition hover:border-zinc-300 ${shell}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconWrap}`}
        >
          <LucideIcon icon={icon} size={20} />
        </span>
        <LucideIcon
          icon={ArrowUpRight}
          size={16}
          className="text-zinc-300 opacity-0 transition group-hover:opacity-100"
        />
      </div>
      <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">{value}</p>
      {sub && <p className={`mt-1 text-xs ${subClass}`}>{sub}</p>}
    </article>
  );
}

function StatusBadge({ blocked }: { blocked: boolean }) {
  if (blocked) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Bloquée
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
      <LucideIcon icon={CircleCheck} size={12} />
      Active
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-zinc-400">{label}</dt>
      <dd className="mt-0.5 text-zinc-600">{value}</dd>
    </div>
  );
}

function EmptyState({ hasData }: { hasData: boolean }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
        <LucideIcon icon={CreditCard} size={28} />
      </span>
      <p className="mt-4 text-base font-semibold text-zinc-900">
        {hasData ? "Aucun résultat" : "Aucune carte créée"}
      </p>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        {hasData
          ? "Modifiez votre recherche pour afficher d'autres invités."
          : "Les cartes apparaîtront ici lorsque les invités auront validé l'OTP et créé leur Visa M-Pesa."}
      </p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-0 px-5 py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 border-b border-zinc-100 py-4 last:border-0"
        >
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-10 w-24 animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-10 w-16 animate-pulse rounded-lg bg-zinc-100" />
        </div>
      ))}
    </div>
  );
}
