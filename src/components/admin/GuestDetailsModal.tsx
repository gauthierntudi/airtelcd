"use client";

import {
  Calendar,
  Check,
  Copy,
  ExternalLink,
  Hash,
  Link2,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Send,
  User,
} from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";
import { GuestMpesaSummary } from "@/components/admin/GuestMpesaSummary";
import { ContactChannelBadges } from "@/components/admin/ContactChannelBadges";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  type GuestRow,
  RSVP_CONFIG,
  formatGuestDate,
} from "@/lib/guest-types";
import { guestInitials } from "@/lib/event";
import { formatInvitedDaysLong } from "@/lib/event-days";
import type { MessagingStatus } from "@/lib/messaging/config";
import { formatPhoneDisplay, whatsAppUrl } from "@/lib/phone";

type Props = {
  guest: GuestRow;
  adminSecret: string;
  messagingStatus: MessagingStatus;
  copied: boolean;
  sending: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onSend: () => void;
};

export function GuestDetailsModal({
  guest,
  adminSecret,
  messagingStatus,
  copied,
  sending,
  onClose,
  onEdit,
  onCopy,
  onSend,
}: Props) {
  const initials = guestInitials(guest.fullName);
  const rsvp = RSVP_CONFIG[guest.rsvpStatus];

  return (
    <AdminModal title="" onClose={onClose} size="xl">
      <div className="-mt-2">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-vodacom-red/20 blur-2xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-vodacom-red text-lg font-bold text-white shadow-lg shadow-vodacom-red/25">
                {initials}
              </span>
              <div>
                <h3 className="text-xl font-bold text-zinc-900">{guest.displayName}</h3>
                <p className="mt-0.5 font-mono text-xs tracking-wide text-zinc-500">
                  {guest.token}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${rsvp.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${rsvp.dot}`} />
                    {rsvp.label}
                  </span>
                  {guest.invitationSentAt ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-vodacom-red/30 bg-vodacom-red/10 px-2.5 py-1 text-[11px] font-medium text-vodacom-red">
                      <LucideIcon icon={Send} size={11} />
                      Invitation envoyée
                    </span>
                  ) : (
                    <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] text-zinc-500">
                      Invitation non envoyée
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ContactChannelBadges
              channels={guest.contactChannels}
              preferred={guest.messageChannel}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <DetailSection title="Identité" icon={User}>
            <DetailItem label="Nom complet" value={guest.fullName ?? "—"} />
            <DetailItem
              label="Jours d'invitation"
              value={formatInvitedDaysLong(guest.eventDays)}
            />
            <DetailItem
              label="Horaire"
              value={guest.invitationTimeRange}
            />
          </DetailSection>

          <DetailSection title="Contact" icon={Mail}>
            <DetailItem
              label="Email"
              value={guest.email ?? "—"}
              href={guest.email ? `mailto:${guest.email}` : undefined}
            />
            <DetailItem
              label="Téléphone"
              value={guest.phone ? formatPhoneDisplay(guest.phone) : "—"}
              href={guest.phone ? whatsAppUrl(guest.phone) : undefined}
              external
              linkIcon={Phone}
            />
            <DetailItem
              label="Canaux à l'envoi"
              value={
                guest.sendChannels.length === 0
                  ? "—"
                  : guest.sendChannels
                      .map((c) => (c === "email" ? "Email" : "WhatsApp"))
                      .join(" + ")
              }
            />
          </DetailSection>

          <DetailSection title="RSVP" icon={Calendar}>
            <DetailItem label="Statut" value={rsvp.label} />
            <DetailItem
              label="Confirmé le"
              value={formatGuestDate(guest.confirmedAt)}
            />
          </DetailSection>

          <DetailSection title="Invitation" icon={Link2}>
            <DetailItem
              label="Envoi"
              value={
                guest.invitationSentAt
                  ? formatGuestDate(guest.invitationSentAt)
                  : "Pas encore envoyée"
              }
            />
            {guest.invitationSentVia && (
              <DetailItem
                label="Canal utilisé"
                value={
                  guest.invitationSentVia === "both"
                    ? "Email + WhatsApp"
                    : guest.invitationSentVia === "email"
                      ? "Email"
                      : "WhatsApp"
                }
              />
            )}
            <DetailItem
              label="Envoi possible"
              value={guest.canSendInvitation ? "Oui" : "Non"}
              hint={
                !messagingStatus.canSendAny
                  ? "APIs non configurées"
                  : !guest.canSendInvitation
                    ? "Contact ou API manquant"
                    : undefined
              }
            />
          </DetailSection>
        </div>

        <GuestMpesaSummary guestId={guest.id} adminSecret={adminSecret} />

        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Lien d&apos;invitation
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-xs text-zinc-700">
              {guest.invitationUrl}
            </code>
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              <LucideIcon icon={copied ? Check : Copy} size={15} />
              {copied ? "Copié" : "Copier"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-3">
          <MetaItem label="ID" value={guest.id} mono />
          <MetaItem label="Créé le" value={formatGuestDate(guest.createdAt)} />
          <MetaItem label="Modifié le" value={formatGuestDate(guest.updatedAt)} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            Fermer
          </button>
          <a
            href={guest.invitationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-300"
          >
            <LucideIcon icon={ExternalLink} size={15} />
            Prévisualiser
          </a>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-300"
          >
            <LucideIcon icon={Pencil} size={15} />
            Modifier
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={onSend}
            className="inline-flex items-center gap-2 rounded-xl bg-vodacom-red px-4 py-2 text-sm font-medium text-white transition hover:bg-vodacom-red-dark disabled:opacity-40"
          >
            <LucideIcon
              icon={sending ? Loader2 : Send}
              size={15}
              className={sending ? "animate-spin" : ""}
            />
            Envoyer
          </button>
        </div>
      </div>
    </AdminModal>
  );
}

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-500">
          <LucideIcon icon={icon} size={16} />
        </span>
        <h4 className="text-sm font-semibold text-zinc-900">{title}</h4>
      </div>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

function DetailItem({
  label,
  value,
  href,
  external,
  hint,
  linkIcon: LinkIcon = Mail,
}: {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  hint?: string;
  linkIcon?: typeof Mail;
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-zinc-900">
        {href && value !== "—" ? (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1.5 text-vodacom-red transition hover:underline"
          >
            {value}
            <LucideIcon icon={LinkIcon} size={13} />
          </a>
        ) : (
          value
        )}
        {hint && <p className="mt-0.5 text-xs text-zinc-400">{hint}</p>}
      </dd>
    </div>
  );
}

function MetaItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
        <LucideIcon icon={Hash} size={10} />
        {label}
      </p>
      <p
        className={`mt-1 truncate text-xs text-zinc-500 ${mono ? "font-mono" : ""}`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
