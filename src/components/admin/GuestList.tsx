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
  UserPlus,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  type GuestRow,
  type RsvpFilter,
  RSVP_CONFIG,
  guestsToCsv,
} from "@/lib/guest-types";
import type { MessagingStatus } from "@/lib/messaging/config";
import { PHONE_INPUT_HINT } from "@/lib/phone";
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [details, setDetails] = useState<GuestRow | null>(null);
  const [editing, setEditing] = useState<GuestRow | null>(null);
  const [deleting, setDeleting] = useState<GuestRow | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [bulkSendConfirm, setBulkSendConfirm] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter((g) => {
      if (filter !== "ALL" && g.rsvpStatus !== filter) return false;
      if (!q) return true;
      return (
        g.displayName.toLowerCase().includes(q) ||
        (g.email?.toLowerCase().includes(q) ?? false) ||
        (g.phone?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [guests, search, filter]);

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
    () => filtered.filter((g) => g.canSendInvitation),
    [filtered],
  );

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
    if (!g.canSendInvitation) {
      notify.error("Envoi impossible");
      return;
    }
    setSendingId(g.id);
    try {
      const res = await fetch(`/api/guests/${g.id}/send`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      const via = data.channel === "email" ? "email" : "WhatsApp";
      notify.success(via === "email" ? "Email envoyé" : "WhatsApp envoyé");
      onChanged();
    } catch (e) {
      notify.error("Échec envoi");
    } finally {
      setSendingId(null);
    }
  }

  async function sendBulkInvitations() {
    if (sendableFiltered.length === 0) return;
    setBulkSendConfirm(false);
    setBulkSending(true);
    try {
      const res = await fetch("/api/guests/send", {
        method: "POST",
        headers,
        body: JSON.stringify({ guestIds: sendableFiltered.map((g) => g.id) }),
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
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#161616]">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-vodacom-red">
              Invités
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">Registre des participants</h2>
            <p className="mt-1 text-sm text-white/45">
              {filtered.length} affiché{filtered.length !== 1 ? "s" : ""} sur {guests.length}
              {notSentCount > 0 && (
                <span className="text-white/35"> · {notSentCount} sans invitation</span>
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
              disabled={!messagingStatus.canSendAny || bulkSending || sendableFiltered.length === 0}
              variant="primary"
              spin={bulkSending}
            >
              Envoyer ({sendableFiltered.length})
            </ToolbarBtn>
            <ToolbarBtn icon={Download} onClick={exportCsv} disabled={filtered.length === 0}>
              CSV
            </ToolbarBtn>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#121212] p-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-md">
            <LucideIcon
              icon={Search}
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, email ou téléphone…"
              className="w-full rounded-xl border border-white/10 bg-[#0c0c0c] py-2.5 pl-9 pr-9 text-sm text-white outline-none placeholder:text-white/30 focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/50 hover:bg-white/10"
                aria-label="Effacer la recherche"
              >
                <LucideIcon icon={X} size={14} />
              </button>
            )}
          </div>
          <div
            className="inline-flex flex-wrap gap-0.5 rounded-lg border border-white/10 bg-[#0c0c0c] p-0.5"
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
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                {f.label}
                <span className={`ml-1.5 tabular-nums ${filter === f.id ? "text-white/80" : "text-white/35"}`}>
                  {counts[f.id]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-white/45">
          <LucideIcon icon={Loader2} size={28} className="animate-spin text-vodacom-red" />
          <p className="text-sm">Chargement du registre…</p>
        </div>
      ) : guests.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <p className="text-sm font-medium text-white/70">Aucun résultat</p>
          <p className="mt-1 max-w-sm text-xs text-white/40">
            Modifiez la recherche ou le filtre RSVP pour afficher des invités.
          </p>
        </div>
      ) : (
        <GuestTable
          key={`${filter}-${search.trim()}`}
          rows={filtered}
          messagingStatus={messagingStatus}
          copiedId={copiedId}
          sendingId={sendingId}
          bulkSending={bulkSending}
          onSend={sendInvitation}
          onCopy={copyLink}
          onDetails={setDetails}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      )}

      {showCreate && (
        <AdminModal title="Nouvel invité" onClose={() => setShowCreate(false)}>
          <GuestCreateForm
            embedded
            headers={headers}
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
            onClose={() => setShowImport(false)}
            onImported={(summary) => {
              setShowImport(false);
              notify.success(summary ?? "Import OK");
              onChanged();
            }}
          />
        </AdminModal>
      )}

      {bulkSendConfirm && (
        <ConfirmDialog
          title="Envoyer les invitations"
          message={
            <>
              Envoyer l&apos;invitation à{" "}
              <strong>{sendableFiltered.length}</strong> invité
              {sendableFiltered.length !== 1 ? "s" : ""} affiché
              {sendableFiltered.length !== 1 ? "s" : ""} ?
            </>
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
      : "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#1f1f1f] px-3 py-2 text-sm font-medium text-white hover:border-vodacom-red/40 hover:bg-white/10 disabled:opacity-50";

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
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <LucideIcon icon={MailOpen} size={28} strokeWidth={1.5} className="text-white/25" />
      </span>
      <p className="mt-4 font-medium text-white">Registre vide</p>
      <p className="mt-1 max-w-xs text-sm text-white/45">
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
  const [firstName, setFirstName] = useState(guest.firstName);
  const [lastName, setLastName] = useState(guest.lastName);
  const [email, setEmail] = useState(guest.email ?? "");
  const [phone, setPhone] = useState(guest.phone ?? "");
  const [rsvpStatus, setRsvpStatus] = useState(guest.rsvpStatus);
  const [eventDays, setEventDays] = useState(guest.eventDays);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/guests/${guest.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
          rsvpStatus,
          eventDays,
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
        <div className="grid gap-4 sm:grid-cols-2">
          <ModalField label="Prénom">
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={modalInputClass}
            />
          </ModalField>
          <ModalField label="Nom">
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={modalInputClass}
            />
          </ModalField>
        </div>
        <ModalField label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={modalInputClass}
          />
        </ModalField>
        <ModalField label="Téléphone">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={modalInputClass}
            placeholder="+243 810 000 000"
          />
          <p className="mt-1 text-xs text-white/45">{PHONE_INPUT_HINT}</p>
        </ModalField>
        <ModalField label="Jours d'invitation">
          <EventDayMultiSelect value={eventDays} onChange={setEventDays} />
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
            className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10"
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
