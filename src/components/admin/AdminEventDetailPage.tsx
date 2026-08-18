"use client";

import { RsvpStatus } from "@prisma/client";
import {
  CalendarRange,
  ChevronLeft,
  CircleCheck,
  Clock,
  Copy,
  FileUp,
  Loader2,
  MapPin,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon as LucideIconType } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminDatePicker } from "@/components/admin/AdminDatePicker";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { GuestCreateForm } from "@/components/admin/GuestCreateForm";
import { GuestImportForm } from "@/components/admin/GuestImportForm";
import { AdminModal, modalInputClass } from "@/components/admin/AdminModal";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { guestInitials } from "@/lib/event";
import {
  fillDayTimes,
  formatCompactTime,
  formatEventPeriod,
  formatEventPeriodShort,
  invitationTimeRangeFromSchedules,
  isoDayToUtcDate,
  isoDaysInRange,
  WHATSAPP_TEMPLATE_KIND_META,
  WHATSAPP_TEMPLATE_KINDS,
  type DaySchedule,
  type EventRow,
  type EventTemplateRow,
} from "@/lib/events";
import { RSVP_CONFIG, type GuestRow } from "@/lib/guest-types";
import type { WhatsAppTemplateKind } from "@prisma/client";
import { notify } from "@/lib/toast";

type Props = {
  adminSecret: string;
  eventId: string;
};

export function AdminEventDetailPage({ adminSecret, eventId }: Props) {
  const [event, setEvent] = useState<EventRow | null>(null);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [venue, setVenue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dayTimes, setDayTimes] = useState<Record<string, DaySchedule>>({});
  const [saving, setSaving] = useState(false);
  const [kind, setKind] = useState<WhatsAppTemplateKind>("INVITATION");
  const [label, setLabel] = useState("");
  const [contentSid, setContentSid] = useState("");
  const [addingTemplate, setAddingTemplate] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendConfirm, setSendConfirm] = useState<EventTemplateRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [guestQuery, setGuestQuery] = useState("");

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
      const [eventRes, guestsRes] = await Promise.all([
        fetch(`/api/events/${eventId}`, {
          headers: { "x-admin-secret": adminSecret },
        }),
        fetch(`/api/guests?eventId=${encodeURIComponent(eventId)}`, {
          headers: { "x-admin-secret": adminSecret },
        }),
      ]);
      const eventData = await eventRes.json();
      const guestsData = await guestsRes.json();
      if (!eventRes.ok) throw new Error(eventData.error ?? "Événement introuvable");
      if (!guestsRes.ok) throw new Error(guestsData.error ?? "Invités introuvables");
      setEvent(eventData);
      setName(eventData.name);
      setVenue(eventData.venue ?? "");
      setStartDate(eventData.startDate);
      setEndDate(eventData.endDate);
      setDayTimes(eventData.dayTimes ?? {});
      setGuests(guestsData);
    } catch (e) {
      notify.error(e instanceof Error ? e.message : "Impossible de charger");
    } finally {
      setLoading(false);
    }
  }, [adminSecret, eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = Boolean(
    event &&
      (name.trim() !== event.name ||
        venue.trim() !== event.venue ||
        startDate !== event.startDate ||
        endDate !== event.endDate ||
        JSON.stringify(dayTimes) !== JSON.stringify(event.dayTimes)),
  );

  function openEditEvent() {
    if (!event) return;
    setName(event.name);
    setVenue(event.venue ?? "");
    setStartDate(event.startDate);
    setEndDate(event.endDate);
    setDayTimes(event.dayTimes);
    setShowEditEvent(true);
  }

  const stats = useMemo(() => {
    const confirmed = guests.filter((g) => g.rsvpStatus === RsvpStatus.CONFIRMED).length;
    const pending = guests.filter((g) => g.rsvpStatus === RsvpStatus.PENDING).length;
    const declined = guests.filter((g) => g.rsvpStatus === RsvpStatus.DECLINED).length;
    const sent = guests.filter((g) => g.invitationSentAt).length;
    return { confirmed, pending, declined, sent, total: guests.length };
  }, [guests]);

  const filteredGuests = useMemo(() => {
    const q = guestQuery.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter(
      (g) =>
        g.displayName.toLowerCase().includes(q) ||
        (g.email?.toLowerCase().includes(q) ?? false) ||
        (g.phone?.includes(q) ?? false),
    );
  }, [guests, guestQuery]);

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          name: name.trim(),
          venue: venue.trim(),
          startDate,
          endDate,
          dayTimes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Enregistrement impossible");
      setEvent(data);
      setShowEditEvent(false);
      notify.success("Événement mis à jour");
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function addTemplate(e: React.FormEvent) {
    e.preventDefault();
    setAddingTemplate(true);
    try {
      const res = await fetch(`/api/events/${eventId}/templates`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          kind,
          label: label.trim() || undefined,
          contentSid: contentSid.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ajout impossible");
      setEvent(data);
      setContentSid("");
      setLabel("");
      setShowAddTemplate(false);
      notify.success("Template ajouté");
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setAddingTemplate(false);
    }
  }

  async function deleteTemplate(templateId: string) {
    try {
      const res = await fetch(
        `/api/events/${eventId}/templates/${templateId}`,
        { method: "DELETE", headers },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Suppression impossible");
      setEvent(data);
      notify.success("Template retiré");
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Erreur");
    }
  }

  async function sendTemplate() {
    if (!sendConfirm) return;
    setSendingId(sendConfirm.id);
    try {
      const res = await fetch(`/api/events/${eventId}/messages/send`, {
        method: "POST",
        headers,
        body: JSON.stringify({ templateId: sendConfirm.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Envoi impossible");
      const sent = data.sent?.length ?? 0;
      const failed = data.failed?.length ?? 0;
      if (failed > 0) {
        notify.warning(`${sent} envoyé(s), ${failed} échec(s)`);
      } else {
        notify.success(`${sent} message(s) envoyé(s)`);
      }
      setSendConfirm(null);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSendingId(null);
    }
  }

  async function copySid(sid: string) {
    try {
      await navigator.clipboard.writeText(sid);
      notify.success("SID copié");
    } catch {
      notify.error("Copie impossible");
    }
  }

  return (
    <AdminLayout
      title={event?.name ?? "Événement"}
      subtitle={
        event ? formatEventPeriod(event.startDate, event.endDate) : "Chargement…"
      }
      onRefresh={load}
      loading={loading}
    >
      <Link
        href="/admin/events"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900"
      >
        <LucideIcon icon={ChevronLeft} size={16} />
        Événements
      </Link>

      {loading && !event ? (
        <PageSkeleton />
      ) : !event ? (
        <p className="text-sm text-zinc-500">Événement introuvable.</p>
      ) : (
        <div className="space-y-6">
          <section className="grid grid-cols-4 gap-3">
            <Kpi
              icon={Users}
              label="Invités"
              value={stats.total}
              sub={`${stats.sent} invitation${stats.sent > 1 ? "s" : ""} envoyée${stats.sent > 1 ? "s" : ""}`}
              tone="red"
            />
            <Kpi
              icon={CircleCheck}
              label="Confirmés"
              value={stats.confirmed}
              sub={`${stats.pending} en attente · ${stats.declined} décliné${stats.declined > 1 ? "s" : ""}`}
              tone="green"
            />
            <Kpi
              icon={MessageSquare}
              label="WhatsApp"
              value={event.templates.length}
              sub={
                event.templates.length === 0
                  ? "Aucun SID enregistré"
                  : "Prêts à envoyer"
              }
              tone="teal"
            />
            <Kpi
              icon={CalendarRange}
              label="Durée"
              value={`${daySpan(event.startDate, event.endDate)} j`}
              sub={formatEventPeriodShort(event.startDate, event.endDate)}
              tone="amber"
            />
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 bg-vodacom-red px-5 py-4 text-white">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-vodacom-red shadow-sm">
                    <span className="text-[10px] font-bold uppercase leading-none tracking-wide">
                      {dateParts(event.startDate).weekday.replace(".", "")}
                    </span>
                    <span className="mt-0.5 text-2xl font-bold leading-none tabular-nums">
                      {dateParts(event.startDate).day}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold capitalize leading-tight">
                      {dateParts(event.startDate).weekdayLong}
                    </p>
                    <p className="text-sm capitalize text-white/80">
                      {dateParts(event.startDate).monthLong}{" "}
                      {dateParts(event.startDate).year}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                  {eventLife(event.startDate, event.endDate).label}
                </span>
              </div>

              <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold leading-snug tracking-tight text-zinc-900 sm:text-2xl">
                        {event.name}
                      </h2>
                      <p className="mt-1 text-sm capitalize text-zinc-500">
                        {formatEventPeriod(event.startDate, event.endDate)}
                      </p>
                      {event.venue ? (
                        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-zinc-600">
                          <LucideIcon
                            icon={MapPin}
                            size={15}
                            className="mt-0.5 shrink-0 text-vodacom-red"
                          />
                          <span>{event.venue}</span>
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={openEditEvent}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      aria-label="Modifier l'événement"
                    >
                      <LucideIcon icon={Pencil} size={16} />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600">
                    <span className="inline-flex items-center gap-1.5">
                      <LucideIcon icon={Clock} size={15} className="text-vodacom-red" />
                      {invitationTimeRangeFromSchedules(
                        isoDaysInRange(event.startDate, event.endDate),
                        event.dayTimes,
                        event.timeRange,
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <LucideIcon icon={CalendarRange} size={15} className="text-vodacom-red" />
                      {daySpan(event.startDate, event.endDate)} jour
                      {daySpan(event.startDate, event.endDate) > 1 ? "s" : ""}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <LucideIcon icon={Users} size={15} className="text-vodacom-red" />
                      {stats.total} invité{stats.total > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2 overflow-x-auto pb-0.5">
                    {isoDaysInRange(event.startDate, event.endDate).map((iso) => {
                      const p = dateParts(iso);
                      const schedule = event.dayTimes[iso];
                      return (
                        <button
                          key={iso}
                          type="button"
                          onClick={openEditEvent}
                          className="min-w-[4.25rem] rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-center hover:border-vodacom-red/40 hover:bg-red-50"
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                            {p.weekday}
                          </p>
                          <p className="text-lg font-bold tabular-nums text-zinc-900">
                            {p.day}
                          </p>
                          {schedule && (
                            <p className="mt-0.5 text-[10px] font-medium text-zinc-500">
                              {formatCompactTime(schedule)}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-vodacom-red">
                    Messages
                  </p>
                  <h2 className="mt-1 text-base font-bold text-zinc-900">
                    Templates WhatsApp
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    SID Twilio (HX…). Variables : nom, dates, token.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setKind("INVITATION");
                    setLabel("");
                    setContentSid("");
                    setShowAddTemplate(true);
                  }}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vodacom-red text-white hover:bg-vodacom-red-dark"
                  aria-label="Ajouter un template"
                >
                  <LucideIcon icon={Plus} size={18} />
                </button>
              </div>

              {event.templates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center">
                  <LucideIcon
                    icon={MessageSquare}
                    size={22}
                    className="mx-auto text-zinc-300"
                  />
                  <p className="mt-2 text-sm text-zinc-500">
                    Ajoutez Invitation, Confirmation ou Rappel pour lancer les
                    envois.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setKind("INVITATION");
                      setLabel("");
                      setContentSid("");
                      setShowAddTemplate(true);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-vodacom-red px-4 py-2 text-sm font-semibold text-white hover:bg-vodacom-red-dark"
                  >
                    <LucideIcon icon={Plus} size={15} />
                    Premier template
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {event.templates.map((template) => (
                    <li
                      key={template.id}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${WHATSAPP_TEMPLATE_KIND_META[template.kind].badge}`}
                            >
                              {WHATSAPP_TEMPLATE_KIND_META[template.kind].label}
                            </span>
                            <p className="truncate font-medium text-zinc-900">
                              {template.label}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void copySid(template.contentSid)}
                            className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-zinc-900"
                          >
                            {template.contentSid}
                            <LucideIcon icon={Copy} size={12} />
                          </button>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSendConfirm(template)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-vodacom-red px-3 py-1.5 text-sm font-semibold text-white hover:bg-vodacom-red-dark"
                          >
                            <LucideIcon icon={Send} size={14} />
                            Envoyer
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteTemplate(template.id)}
                            className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                            aria-label="Supprimer le template"
                          >
                            <LucideIcon icon={Trash2} size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-zinc-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-vodacom-red">
                  Liste
                </p>
                <h2 className="mt-1 text-base font-bold text-zinc-900">Invités</h2>
                {stats.total > 0 && (
                  <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-vodacom-red"
                      style={{
                        width: `${Math.round((stats.confirmed / stats.total) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <LucideIcon
                    icon={Search}
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    value={guestQuery}
                    onChange={(e) => setGuestQuery(e.target.value)}
                    placeholder="Rechercher…"
                    className="h-10 w-48 rounded-xl border border-zinc-200 bg-white pl-8 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-vodacom-red/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowImport(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 hover:bg-zinc-100"
                >
                  <LucideIcon icon={FileUp} size={15} />
                  Importer
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-vodacom-red px-3 text-sm font-semibold text-white hover:bg-vodacom-red-dark"
                >
                  <LucideIcon icon={UserPlus} size={15} />
                  Ajouter
                </button>
              </div>
            </div>

            {guests.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <LucideIcon
                  icon={Users}
                  size={28}
                  className="mx-auto text-zinc-300"
                />
                <p className="mt-3 text-sm font-medium text-zinc-600">
                  Aucun invité sur cet événement
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Ajoutez-les un par un ou importez un CSV.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-vodacom-red px-4 py-2 text-sm font-semibold text-white hover:bg-vodacom-red-dark"
                >
                  <LucideIcon icon={UserPlus} size={15} />
                  Premier invité
                </button>
              </div>
            ) : filteredGuests.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-zinc-500">
                Aucun résultat pour « {guestQuery} »
              </p>
            ) : (
              <ul className="max-h-[560px] divide-y divide-zinc-100 overflow-y-auto">
                {filteredGuests.map((g) => {
                  const rsvp = RSVP_CONFIG[g.rsvpStatus];
                  return (
                    <li
                      key={g.id}
                      className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-zinc-50"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-900">
                        {guestInitials(g.fullName)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-zinc-900">
                          {g.displayName}
                        </p>
                        <p className="truncate text-xs text-zinc-400">
                          {g.phone || g.email || "Sans contact"}
                          {g.invitationSentAt ? " · Invitation envoyée" : ""}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${rsvp.badge}`}
                      >
                        {rsvp.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      {showEditEvent && (
        <AdminModal
          title="Modifier l'événement"
          size="lg"
          onClose={() => {
            if (event) {
              setName(event.name);
              setVenue(event.venue ?? "");
              setStartDate(event.startDate);
              setEndDate(event.endDate);
              setDayTimes(event.dayTimes);
            }
            setShowEditEvent(false);
          }}
        >
          <form onSubmit={saveMeta} className="grid gap-4">
            <label className="block">
              <span className="text-sm font-medium text-zinc-600">Nom</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1.5 ${modalInputClass}`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-600">Lieu</span>
              <input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Golf Club de Kinshasa, Gombe"
                className={`mt-1.5 ${modalInputClass}`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-600">
                Date de début
              </span>
              <AdminDatePicker
                required
                value={startDate}
                onChange={(iso) => {
                  setStartDate(iso);
                  const nextEnd = !endDate || endDate < iso ? iso : endDate;
                  if (nextEnd !== endDate) setEndDate(nextEnd);
                  setDayTimes((prev) =>
                    fillDayTimes(iso, nextEnd, prev, event?.timeRange ?? "14h00 – 19h00"),
                  );
                }}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-600">
                Date de fin
              </span>
              <AdminDatePicker
                required
                min={startDate || undefined}
                value={endDate}
                onChange={(iso) => {
                  setEndDate(iso);
                  setDayTimes((prev) =>
                    fillDayTimes(
                      startDate || iso,
                      iso,
                      prev,
                      event?.timeRange ?? "14h00 – 19h00",
                    ),
                  );
                }}
              />
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-600">
                  Horaires par jour
                </span>
                {isoDaysInRange(startDate, endDate).length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const first = isoDaysInRange(startDate, endDate)[0];
                      const source = first ? dayTimes[first] : undefined;
                      if (!first || !source) return;
                      setDayTimes((prev) => {
                        const next = { ...prev };
                        for (const day of isoDaysInRange(startDate, endDate)) {
                          next[day] = { ...source };
                        }
                        return next;
                      });
                    }}
                    className="text-xs font-medium text-vodacom-red hover:underline"
                  >
                    Copier le 1er jour
                  </button>
                )}
              </div>
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                <div className="grid grid-cols-[1fr_5.5rem_5.5rem] gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  <span>Jour</span>
                  <span>Début</span>
                  <span>Fin</span>
                </div>
                <ul>
                  {isoDaysInRange(startDate, endDate).map((iso, i, days) => {
                    const p = dateParts(iso);
                    const schedule = dayTimes[iso] ?? {
                      start: "14:00",
                      end: "19:00",
                    };
                    return (
                      <li
                        key={iso}
                        className={`grid grid-cols-[1fr_5.5rem_5.5rem] items-center gap-2 px-3 py-2 ${
                          i < days.length - 1 ? "border-b border-zinc-100" : ""
                        }`}
                      >
                        <span className="min-w-0 truncate text-sm font-medium capitalize text-zinc-800">
                          {p.weekday} {p.day} {p.month}
                        </span>
                        <input
                          type="time"
                          required
                          aria-label={`Ouverture ${iso}`}
                          value={schedule.start}
                          onChange={(e) =>
                            setDayTimes((prev) => ({
                              ...prev,
                              [iso]: { ...schedule, start: e.target.value },
                            }))
                          }
                          className={timeInputClass}
                        />
                        <input
                          type="time"
                          required
                          aria-label={`Fermeture ${iso}`}
                          value={schedule.end}
                          onChange={(e) =>
                            setDayTimes((prev) => ({
                              ...prev,
                              [iso]: { ...schedule, end: e.target.value },
                            }))
                          }
                          className={timeInputClass}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !dirty}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-vodacom-red px-5 font-semibold text-white transition hover:bg-vodacom-red-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        </AdminModal>
      )}

      {showAddTemplate && (
        <AdminModal
          title="Ajouter un template WhatsApp"
          onClose={() => setShowAddTemplate(false)}
        >
          <form onSubmit={addTemplate} className="grid gap-4">
            <label className="block">
              <span className="text-sm font-medium text-zinc-600">Type</span>
              <select
                value={kind}
                onChange={(e) =>
                  setKind(e.target.value as WhatsAppTemplateKind)
                }
                className={`mt-1.5 ${modalInputClass}`}
              >
                {WHATSAPP_TEMPLATE_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {WHATSAPP_TEMPLATE_KIND_META[k].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-600">Libellé</span>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={WHATSAPP_TEMPLATE_KIND_META[kind].label}
                className={`mt-1.5 ${modalInputClass}`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-600">
                Content SID
              </span>
              <input
                required
                value={contentSid}
                onChange={(e) => setContentSid(e.target.value)}
                placeholder="HXxxxxxxxx"
                className={`mt-1.5 font-mono text-sm ${modalInputClass}`}
              />
            </label>
            <p className="text-xs text-zinc-500">
              {WHATSAPP_TEMPLATE_KIND_META[kind].hint}
            </p>
            <button
              type="submit"
              disabled={addingTemplate}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-vodacom-red px-5 font-semibold text-white hover:bg-vodacom-red-dark disabled:opacity-60"
            >
              <LucideIcon
                icon={addingTemplate ? Loader2 : Plus}
                size={16}
                className={addingTemplate ? "animate-spin" : ""}
              />
              {addingTemplate ? "Ajout…" : "Ajouter le template"}
            </button>
          </form>
        </AdminModal>
      )}

      {showCreate && (
        <AdminModal title="Ajouter un invité" onClose={() => setShowCreate(false)}>
          <GuestCreateForm
            embedded
            headers={headers}
            defaultEventId={eventId}
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              void load();
            }}
          />
        </AdminModal>
      )}

      {showImport && (
        <AdminModal
          title="Importer des invités"
          onClose={() => setShowImport(false)}
          size="lg"
        >
          <GuestImportForm
            embedded
            headers={headers}
            defaultEventId={eventId}
            onClose={() => setShowImport(false)}
            onImported={() => {
              setShowImport(false);
              void load();
            }}
          />
        </AdminModal>
      )}

      {sendConfirm && (
        <ConfirmDialog
          title={`Envoyer « ${sendConfirm.label} » ?`}
          message="Le message WhatsApp partira aux invités éligibles de cet événement (numéro requis)."
          confirmLabel="Envoyer"
          loading={sendingId === sendConfirm.id}
          onClose={() => setSendConfirm(null)}
          onConfirm={() => void sendTemplate()}
        />
      )}
    </AdminLayout>
  );
}

const KPI_TONES = {
  red: "bg-[#E60000] border-[#E60000]",
  green: "bg-[#16A34A] border-[#16A34A]",
  teal: "bg-[#0D9488] border-[#0D9488]",
  amber: "bg-[#EA580C] border-[#EA580C]",
} as const;

function Kpi({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: LucideIconType;
  label: string;
  value: number | string;
  sub: string;
  tone: keyof typeof KPI_TONES;
}) {
  return (
    <article
      className={`min-w-0 rounded-2xl border p-4 text-white shadow-lg ${KPI_TONES[tone]}`}
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
        <LucideIcon icon={icon} size={18} />
      </div>
      <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-white/80">
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight">
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-white/80">{sub}</p>
    </article>
  );
}

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-zinc-100" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-72 rounded-2xl bg-zinc-100" />
        <div className="h-72 rounded-2xl bg-zinc-100" />
      </div>
      <div className="h-64 rounded-2xl bg-zinc-100" />
    </div>
  );
}

const timeInputClass =
  "h-9 w-full rounded-md border border-zinc-200 bg-white px-1.5 text-sm tabular-nums text-zinc-900 outline-none focus:border-vodacom-red/50 focus:ring-1 focus:ring-vodacom-red/20";

function dateParts(iso: string) {
  const d = isoDayToUtcDate(iso);
  return {
    weekday: d.toLocaleDateString("fr-FR", { weekday: "short", timeZone: "UTC" }),
    weekdayLong: d.toLocaleDateString("fr-FR", {
      weekday: "long",
      timeZone: "UTC",
    }),
    day: d.getUTCDate(),
    month: d.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" }),
    monthLong: d.toLocaleDateString("fr-FR", { month: "long", timeZone: "UTC" }),
    year: d.getUTCFullYear(),
  };
}

function eventLife(start: string, end: string) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (today < start) {
    return { label: "À venir", className: "bg-sky-50 text-sky-800" };
  }
  if (today > end) {
    return { label: "Terminé", className: "bg-zinc-100 text-zinc-600" };
  }
  return { label: "En cours", className: "bg-emerald-50 text-emerald-800" };
}

function daySpan(start: string, end: string): number {
  const a = new Date(`${start}T12:00:00Z`).getTime();
  const b = new Date(`${end}T12:00:00Z`).getTime();
  return Math.max(1, Math.round((b - a) / 86_400_000) + 1);
}
