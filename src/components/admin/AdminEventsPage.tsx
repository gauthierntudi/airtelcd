"use client";

import { CalendarPlus, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminDatePicker } from "@/components/admin/AdminDatePicker";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  formatEventPeriod,
  type EventRow,
} from "@/lib/events";
import { notify } from "@/lib/toast";
import { publicPath } from "@/lib/branding";

type Props = {
  adminSecret: string;
};

export function AdminEventsPage({ adminSecret }: Props) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [venue, setVenue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<EventRow | null>(null);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-admin-secret": adminSecret,
    }),
    [adminSecret],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(publicPath("/api/events"), {
        headers: { "x-admin-secret": adminSecret },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setEvents(data);
    } catch (e) {
      notify.error(e instanceof Error ? e.message : "Impossible de charger");
    } finally {
      setLoading(false);
    }
  }, [adminSecret]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(publicPath("/api/events"), {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: name.trim(),
          venue: venue.trim(),
          startDate,
          endDate: endDate || startDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Impossible de créer");
      setName("");
      setVenue("");
      setStartDate("");
      setEndDate("");
      notify.success("Événement créé");
      await load();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCreating(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      const res = await fetch(publicPath(`/api/events/${deleting.id}`), {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Suppression impossible");
      notify.success("Événement supprimé");
      setDeleting(null);
      await load();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <AdminLayout
      title="Événements"
      subtitle="Nom, période, invités et templates WhatsApp"
      onRefresh={load}
      loading={loading}
    >
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-base font-bold text-zinc-900">Nouvel événement</h2>
        <p className="mt-0.5 text-sm text-zinc-500">
          Chaque événement a une période (début et fin). Les invités y sont
          rattachés, puis vous y associez les SID de templates WhatsApp.
        </p>
        <form
          onSubmit={handleCreate}
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:items-end"
        >
          <label className="block">
            <span className="text-sm font-medium text-zinc-900">Nom</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lancement Airtel Money"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-900">Lieu</span>
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Golf Club de Kinshasa, Gombe"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-900">Date de début</span>
            <AdminDatePicker
              required
              value={startDate}
              onChange={(iso) => {
                setStartDate(iso);
                if (!endDate || endDate < iso) setEndDate(iso);
              }}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-900">Date de fin</span>
            <AdminDatePicker
              required
              min={startDate || undefined}
              value={endDate}
              onChange={setEndDate}
            />
          </label>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl bg-vodacom-red px-5 font-semibold text-white hover:bg-vodacom-red-dark disabled:opacity-60"
          >
            <LucideIcon icon={creating ? Loader2 : CalendarPlus} size={18} />
            {creating ? "Création…" : "Créer"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Chargement…</p>
        ) : events.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">
            Aucun événement. Créez-en un pour y ajouter des invités.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="font-semibold text-zinc-900 hover:text-vodacom-red"
                  >
                    {event.name}
                  </Link>
                  <p className="text-sm capitalize text-zinc-500">
                    {formatEventPeriod(event.startDate, event.endDate)}
                    {event.venue ? ` · ${event.venue}` : ""} · {event.guestCount}{" "}
                    invité{event.guestCount > 1 ? "s" : ""} ·{" "}
                    {event.templates.length} template
                    {event.templates.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 hover:bg-zinc-100"
                  >
                    Ouvrir
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleting(event)}
                    className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    aria-label="Supprimer"
                  >
                    <LucideIcon icon={Trash2} size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {deleting && (
        <ConfirmDialog
          title="Supprimer l’événement ?"
          message="Les invités ne seront pas supprimés, seulement détachés de cet événement. Les templates WhatsApp seront effacés."
          confirmLabel="Supprimer"
          variant="danger"
          onClose={() => setDeleting(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </AdminLayout>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/20";
