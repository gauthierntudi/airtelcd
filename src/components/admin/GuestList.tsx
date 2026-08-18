"use client";

import { RsvpStatus } from "@prisma/client";
import {
  Download,
  FileUp,
  Loader2,
  MailOpen,
  RefreshCw,
  Search,
  Send,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdminModal,
  ModalField,
  modalInputClass,
} from "@/components/admin/AdminModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EventDayMultiSelect } from "@/components/admin/EventDayMultiSelect";
import { GuestCreateForm } from "@/components/admin/GuestCreateForm";
import { GuestImportForm } from "@/components/admin/GuestImportForm";
import { GuestDetailsModal } from "@/components/admin/GuestDetailsModal";
import { GuestTable } from "@/components/admin/GuestTable";
import { InvitationSendOptions } from "@/components/admin/InvitationSendOptions";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  type GuestRow,
  type RsvpFilter,
  RSVP_CONFIG,
  guestsToCsv,
} from "@/lib/guest-types";
import type { MessagingStatus } from "@/lib/messaging/config";
import {
  canSendGuestWithOptions,
  DEFAULT_SEND_OPTIONS,
  getGuestSendBlockReason,
  type SendInvitationOptions,
} from "@/lib/messaging/send-options";
import type { EventSummary } from "@/lib/events";
import { AdminPhoneInput } from "@/components/admin/AdminPhoneInput";
import {
  DEFAULT_INVITATION_TIME_RANGE,
  invitationTimeRangeForEventDays,
} from "@/lib/invitation-time-range";
import { notify } from "@/lib/toast";

const FILTERS: { id: RsvpFilter; label: string }[] = [
  { id: "ALL", label: "Tous" },
  { id: RsvpStatus.PENDING, label: "En attente" },
  { id: RsvpStatus.CONFIRMED, label: "Confirmés" },
  { id: RsvpStatus.DECLINED, label: "Déclinés" },
];

type Props = {
  guests: GuestRow[];
  loading: boolean;
  headers: Record<string, string>;
  messagingStatus: MessagingStatus;
  onChanged: () => void;
};

export function GuestList({
  guests,
  loading,
  headers,
  messagingStatus,
  onChanged,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RsvpFilter>("ALL");
  const [eventFilter, setEventFilter] = useState("");
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [details, setDetails] = useState<GuestRow | null>(null);
  const [editing, setEditing] = useState<GuestRow | null>(null);
  const [deleting, setDeleting] = useState<GuestRow | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [bulkSendConfirm, setBulkSendConfirm] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [sendOptions, setSendOptions] =
    useState<SendInvitationOptions>(DEFAULT_SEND_OPTIONS);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter((g) => {
      if (eventFilter && g.eventId !== eventFilter) return false;
      if (filter !== "ALL" && g.rsvpStatus !== filter) return false;
      if (!q) return true;
      return (
        g.displayName.toLowerCase().includes(q) ||
        (g.email?.toLowerCase().includes(q) ?? false) ||
        (g.phone?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [guests, search, filter, eventFilter]);

  const selectedCount = selectedIds.size;

  useEffect(() => {
    const visible = new Set(filtered.map((g) => g.id));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => visible.has(id)));
      if (next.size === prev.size && [...next].every((id) => prev.has(id))) {
        return prev;
      }
      return next;
    });
  }, [filtered]);

  useEffect(() => {
    const secret = headers["x-admin-secret"];
    void fetch("/api/events", {
      headers: secret ? { "x-admin-secret": secret } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => undefined);
  }, [headers]);

  const counts = useMemo(() => {
    const c: Record<RsvpFilter, number> = {
      ALL: guests.length,
      PENDING: 0,
      CONFIRMED: 0,
      DECLINED: 0,
    };
    for (const g of guests) c[g.rsvpStatus]++;
    return c;
  }, [guests]);

  const sendableFiltered = useMemo(
    () =>
      filtered.filter((g) =>
        canSendGuestWithOptions(g, sendOptions, messagingStatus),
      ),
    [filtered, sendOptions, messagingStatus],
  );

  const canSendNow =
    sendOptions.channels.email || sendOptions.channels.whatsapp;

  const notSentCount = useMemo(
    () => filtered.filter((g) => !g.invitationSentAt).length,
    [filtered],
  );

  async function copyLink(url: string, id: string) {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    notify.success("Lien copié");
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function sendInvitation(g: GuestRow) {
    if (!messagingStatus.canSendAny) {
      notify.error("Envoi indisponible");
      return;
    }
    if (!canSendNow) {
      notify.error("Sélectionnez au moins un canal");
      return;
    }
    if (!canSendGuestWithOptions(g, sendOptions, messagingStatus)) {
      notify.error(
        getGuestSendBlockReason(g, sendOptions, messagingStatus) ??
          "Envoi impossible pour cet invité avec ces canaux",
      );
      return;
    }
    setSendingId(g.id);
    try {
      const res = await fetch(`/api/guests/${g.id}/send`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(sendOptions),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      const label =
        data.channel === "both"
          ? "Email et WhatsApp envoyés"
          : data.channel === "email"
            ? "Email envoyé"
            : "WhatsApp envoyé";
      notify.success(label);
      if (Array.isArray(data.warnings) && data.warnings.length > 0) {
        notify.warning(data.warnings.join(" · "));
      }
      onChanged();
    } catch (e) {
      notify.error("Échec envoi");
    } finally {
      setSendingId(null);
    }
  }

  function toggleGuestSelected(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function togglePageSelected(pageIds: string[], checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of pageIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedIds(new Set(filtered.map((g) => g.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function deleteBulkGuests() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setBulkDeleteConfirm(false);
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/guests/delete", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ guestIds: ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      const deleted = data.deleted as number;
      notify.success(
        deleted !== 1 ? `${deleted} invités supprimés` : "1 invité supprimé",
      );
      if (deleted < ids.length) {
        notify.warning(
          `${ids.length - deleted} suppression(s) non effectuée(s)`,
        );
      }
      clearSelection();
      onChanged();
    } catch {
      notify.error("Échec suppression");
    } finally {
      setBulkDeleting(false);
    }
  }

  async function sendBulkInvitations() {
    if (sendableFiltered.length === 0 || !canSendNow) return;
    setBulkSendConfirm(false);
    setBulkSending(true);
    try {
      const res = await fetch("/api/guests/send", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          guestIds: sendableFiltered.map((g) => g.id),
          ...sendOptions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      notify.success(
        data.failed.length > 0
          ? `${data.sent.length} envoyés · ${data.failed.length} échecs`
          : `${data.sent.length} envoyés`,
      );
      if (data.failed.length > 0) {
        notify.warning(`${data.failed.length} échec(s)`);
      }
      onChanged();
    } catch (e) {
      notify.error("Échec envoi");
    } finally {
      setBulkSending(false);
    }
  }

  function exportCsv() {
    const blob = new Blob([guestsToCsv(filtered)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invites-golf2026-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-6 py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-vodacom-red">
              Invités
            </p>
            <h2 className="mt-1 text-lg font-bold text-zinc-900">Registre des participants</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {filtered.length} affiché{filtered.length !== 1 ? "s" : ""} sur {guests.length}
              {eventFilter && (
                <span className="text-zinc-400">
                  {" "}
                  · {events.find((e) => e.id === eventFilter)?.name}
                </span>
              )}
              {selectedCount > 0 && (
                <span className="text-vodacom-red/90">
                  {" "}
                  · {selectedCount} sélectionné{selectedCount !== 1 ? "s" : ""}
                </span>
              )}
              {notSentCount > 0 && (
                <span className="text-zinc-400"> · {notSentCount} sans invitation</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <ToolbarBtn icon={UserPlus} onClick={() => setShowCreate(true)}>
              Ajouter
            </ToolbarBtn>
            <ToolbarBtn icon={FileUp} onClick={() => setShowImport(true)}>
              Importer
            </ToolbarBtn>
            <ToolbarBtn icon={RefreshCw} onClick={onChanged} disabled={loading} spin={loading}>
              Actualiser
            </ToolbarBtn>
            <ToolbarBtn
              icon={bulkSending ? Loader2 : Send}
              onClick={() => setBulkSendConfirm(true)}
              disabled={
                !messagingStatus.canSendAny ||
                !canSendNow ||
                bulkSending ||
                bulkDeleting ||
                sendableFiltered.length === 0
              }
              variant="primary"
              spin={bulkSending}
            >
              Envoyer ({sendableFiltered.length})
            </ToolbarBtn>
            <ToolbarBtn
              icon={bulkDeleting ? Loader2 : Trash2}
              onClick={() => setBulkDeleteConfirm(true)}
              disabled={bulkDeleting || bulkSending || selectedCount === 0}
              spin={bulkDeleting}
            >
              Supprimer ({selectedCount})
            </ToolbarBtn>
            <ToolbarBtn icon={Download} onClick={exportCsv} disabled={filtered.length === 0}>
              CSV
            </ToolbarBtn>
          </div>
        </div>

        <div className="mt-5">
          <InvitationSendOptions
            value={sendOptions}
            onChange={setSendOptions}
            messagingStatus={messagingStatus}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-md">
            <LucideIcon
              icon={Search}
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, email ou téléphone…"
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-9 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:bg-zinc-100"
                aria-label="Effacer la recherche"
              >
                <LucideIcon icon={X} size={14} />
              </button>
            )}
          </div>
          <div
            className="inline-flex flex-wrap gap-0.5 rounded-lg border border-zinc-200 bg-white p-0.5"
            role="tablist"
            aria-label="Filtrer par RSVP"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  filter === f.id
                    ? "bg-vodacom-red text-white shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                {f.label}
                <span className={`ml-1.5 tabular-nums ${filter === f.id ? "text-zinc-600" : "text-zinc-400"}`}>
                  {counts[f.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Événement (date)
          </p>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="max-w-md rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
            aria-label="Filtrer par événement"
          >
            <option value="">Tous les événements</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} — {event.startDate === event.endDate
                  ? event.startDate.split("-").reverse().join("/")
                  : `${event.startDate.split("-").reverse().join("/")} – ${event.endDate.split("-").reverse().join("/")}`} ({event.guestCount})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-500">
          <LucideIcon icon={Loader2} size={28} className="animate-spin text-vodacom-red" />
          <p className="text-sm">Chargement du registre…</p>
        </div>
      ) : guests.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <p className="text-sm font-medium text-zinc-600">Aucun résultat</p>
          <p className="mt-1 max-w-sm text-xs text-zinc-400">
            Modifiez la recherche, le lot ou le filtre RSVP pour afficher des invités.
          </p>
        </div>
      ) : (
        <>
          {selectedCount > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-6 py-2.5">
              <p className="text-sm text-zinc-600">
                <span className="font-vodafone-rg-bd text-zinc-900">
                  {selectedCount}
                </span>{" "}
                invité{selectedCount !== 1 ? "s" : ""} sélectionné
                {selectedCount !== 1 ? "s" : ""}
              </p>
              {selectedCount < filtered.length && (
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="text-xs font-medium text-vodacom-red hover:underline"
                >
                  Tout sélectionner ({filtered.length} affichés)
                </button>
              )}
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs font-medium text-zinc-500 hover:text-zinc-600"
              >
                Tout désélectionner
              </button>
            </div>
          )}
          <GuestTable
            key={`${eventFilter}-${filter}-${search.trim()}`}
            rows={filtered}
            selectedIds={selectedIds}
            messagingStatus={messagingStatus}
            sendOptions={sendOptions}
            copiedId={copiedId}
            sendingId={sendingId}
            bulkSending={bulkSending}
            bulkDeleting={bulkDeleting}
            onToggleGuestSelected={toggleGuestSelected}
            onTogglePageSelected={togglePageSelected}
            onSend={sendInvitation}
            onCopy={copyLink}
            onDetails={setDetails}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        </>
      )}

      {showCreate && (
        <AdminModal title="Nouvel invité" onClose={() => setShowCreate(false)}>
          <GuestCreateForm
            embedded
            headers={headers}
            defaultEventId={eventFilter || undefined}
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              notify.success("Invité créé");
              onChanged();
            }}
          />
        </AdminModal>
      )}
      {showImport && (
        <AdminModal title="Importer des invités" onClose={() => setShowImport(false)} size="lg">
          <GuestImportForm
            embedded
            headers={headers}
            defaultEventId={eventFilter || undefined}
            onClose={() => setShowImport(false)}
            onImported={(summary) => {
              setShowImport(false);
              notify.success(summary ?? "Import OK");
              onChanged();
            }}
          />
        </AdminModal>
      )}

      {bulkDeleteConfirm && (
        <ConfirmDialog
          title="Supprimer les invités"
          message={
            <div className="space-y-3">
              <p>
                Supprimer définitivement <strong>{selectedCount}</strong> invité
                {selectedCount !== 1 ? "s" : ""} sélectionné
                {selectedCount !== 1 ? "s" : ""} ? Les liens d&apos;invitation ne
                fonctionneront plus.
              </p>
              <p className="text-xs text-zinc-500">
                Cette action est irréversible (RSVP, OTP, carte M-Pesa liés inclus).
              </p>
            </div>
          }
          confirmLabel="Supprimer"
          variant="danger"
          loading={bulkDeleting}
          onClose={() => setBulkDeleteConfirm(false)}
          onConfirm={deleteBulkGuests}
        />
      )}

      {bulkSendConfirm && (
        <ConfirmDialog
          title="Envoyer les invitations"
          message={
            <div className="space-y-4">
              <p>
                Envoyer l&apos;invitation à{" "}
                <strong>{sendableFiltered.length}</strong> invité
                {sendableFiltered.length !== 1 ? "s" : ""} affiché
                {sendableFiltered.length !== 1 ? "s" : ""}
                {eventFilter ? (
                  <>
                    {" "}
                    de <strong>{events.find((e) => e.id === eventFilter)?.name}</strong>
                  </>
                ) : null}
                ?
              </p>
              <InvitationSendOptions
                compact
                value={sendOptions}
                onChange={setSendOptions}
                messagingStatus={messagingStatus}
              />
            </div>
          }
          confirmLabel="Envoyer"
          loading={bulkSending}
          onClose={() => setBulkSendConfirm(false)}
          onConfirm={sendBulkInvitations}
        />
      )}

      {details && (
        <GuestDetailsModal
          guest={guests.find((g) => g.id === details.id) ?? details}
          adminSecret={headers["x-admin-secret"]}
          messagingStatus={messagingStatus}
          copied={copiedId === details.id}
          sending={sendingId === details.id}
          onClose={() => setDetails(null)}
          onEdit={() => {
            setEditing(details);
            setDetails(null);
          }}
          onCopy={() => copyLink(details.invitationUrl, details.id)}
          onSend={() => {
            void sendInvitation(details);
          }}
        />
      )}

      {editing && (
        <GuestEditModal
          guest={editing}
          headers={headers}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            notify.success("Mis à jour");
            onChanged();
          }}
        />
      )}
      {deleting && (
        <ConfirmDeleteModal
          guest={deleting}
          headers={headers}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            notify.success("Supprimé");
            onChanged();
          }}
        />
      )}
    </section>
  );
}

function ToolbarBtn({
  children,
  icon,
  onClick,
  disabled,
  variant,
  spin,
}: {
  children: React.ReactNode;
  icon: typeof RefreshCw;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary";
  spin?: boolean;
}) {
  const className =
    variant === "primary"
      ? "inline-flex items-center gap-2 rounded-xl bg-vodacom-red px-3 py-2 text-sm font-medium text-white hover:bg-vodacom-red-dark disabled:opacity-50"
      : "inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-900 hover:border-vodacom-red/40 hover:bg-zinc-100 disabled:opacity-50";

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      <LucideIcon icon={icon} size={15} className={spin ? "animate-spin" : ""} />
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100">
        <LucideIcon icon={MailOpen} size={28} strokeWidth={1.5} className="text-zinc-300" />
      </span>
      <p className="mt-4 font-medium text-zinc-900">Registre vide</p>
      <p className="mt-1 max-w-xs text-sm text-zinc-500">
        Ajoutez un invité manuellement ou importez une liste CSV pour commencer.
      </p>
    </div>
  );
}

function GuestEditModal({
  guest,
  headers,
  onClose,
  onSaved,
}: {
  guest: GuestRow;
  headers: Record<string, string>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState(guest.fullName ?? "");
  const [email, setEmail] = useState(guest.email ?? "");
  const [phone, setPhone] = useState(guest.phone ?? "");
  const [rsvpStatus, setRsvpStatus] = useState(guest.rsvpStatus);
  const [eventDays, setEventDays] = useState(guest.eventDays);
  const [invitationTimeRange, setInvitationTimeRange] = useState(
    guest.invitationTimeRange,
  );
  const initialEventDaysRef = useRef(guest.eventDays);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initial = initialEventDaysRef.current;
    const daysChanged =
      eventDays.length !== initial.length ||
      eventDays.some((d, i) => d !== initial[i]);
    if (daysChanged) {
      setInvitationTimeRange(invitationTimeRangeForEventDays(eventDays));
    }
  }, [eventDays]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/guests/${guest.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          fullName: fullName.trim() || null,
          email: email || null,
          phone: phone || null,
          rsvpStatus,
          eventDays,
          invitationTimeRange,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      onSaved();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminModal title={`Modifier — ${guest.displayName}`} onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <ModalField label="Nom complet" hint="Facultatif">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={modalInputClass}
          />
        </ModalField>
        <ModalField label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={modalInputClass}
          />
        </ModalField>
        <ModalField label="Téléphone">
          <AdminPhoneInput
            id="edit-guest-phone"
            value={phone}
            onChange={setPhone}
            inputClass={modalInputClass}
          />
        </ModalField>
        <ModalField label="Jours d'invitation">
          <EventDayMultiSelect value={eventDays} onChange={setEventDays} />
        </ModalField>
        <ModalField label="Horaire d'invitation">
          <input
            value={invitationTimeRange}
            onChange={(e) => setInvitationTimeRange(e.target.value)}
            className={modalInputClass}
            placeholder={DEFAULT_INVITATION_TIME_RANGE}
          />
          <p className="mt-1 text-xs text-zinc-500">
            Utilisé dans l&apos;email (variables horaires) et la page invitation.
          </p>
        </ModalField>
        <ModalField label="Statut RSVP">
          <select
            value={rsvpStatus}
            onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
            className={modalInputClass}
          >
            {Object.values(RsvpStatus).map((s) => (
              <option key={s} value={s}>
                {RSVP_CONFIG[s].label}
              </option>
            ))}
          </select>
        </ModalField>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-vodacom-red px-4 py-2 text-sm font-semibold text-white hover:bg-vodacom-red-dark disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

function ConfirmDeleteModal({
  guest,
  headers,
  onClose,
  onDeleted,
}: {
  guest: GuestRow;
  headers: Record<string, string>;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/guests/${guest.id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      onDeleted();
    } catch (err) {
      notify.error("Erreur");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ConfirmDialog
      title="Supprimer l'invité"
      message={
        <>
          Supprimer <strong>{guest.displayName}</strong> ? Le lien d&apos;invitation ne
          fonctionnera plus.
        </>
      }
      confirmLabel="Supprimer"
      variant="danger"
      loading={deleting}
      onClose={onClose}
      onConfirm={handleDelete}
    />
  );
}
