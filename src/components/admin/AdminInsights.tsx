"use client";

import { AdminPanel, ProgressBar, StatTile } from "@/components/admin/AdminPanel";
import type { GuestRow } from "@/lib/guest-types";
import type { MessagingStatus } from "@/lib/messaging/config";

type Props = {
  guests: GuestRow[];
  messagingStatus: MessagingStatus;
};

export function AdminInsights({ guests, messagingStatus }: Props) {
  const total = guests.length;
  const sent = guests.filter((g) => g.invitationSentAt).length;
  const notSent = total - sent;
  const sendable = guests.filter((g) => g.canSendInvitation).length;
  const emailChannel = guests.filter((g) => g.messageChannel === "email").length;
  const whatsappChannel = guests.filter((g) => g.messageChannel === "whatsapp").length;

  const sentPct = total > 0 ? (sent / total) * 100 : 0;
  const notSentPct = total > 0 ? 100 - sentPct : 0;

  const apiOk = messagingStatus.brevo && messagingStatus.twilioWhatsapp;
  const apiBadge = apiOk ? "APIs OK" : messagingStatus.canSendAny ? "Partiel" : "Hors ligne";

  return (
    <AdminPanel
      title="Invitations & canaux"
      description={`Envoi et préférences de contact · ${total} invité${total !== 1 ? "s" : ""}`}
      badge={apiBadge}
    >
      {total === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-zinc-400">
          Aucune donnée d&apos;invitation
        </p>
      ) : (
        <>
          <ProgressBar
            segments={[
              { label: "Envoyées", className: "bg-vodacom-red", width: sentPct },
              { label: "En attente", className: "bg-zinc-300", width: notSentPct },
            ]}
          />
          <ul className="mt-auto grid flex-1 grid-cols-3 gap-3">
            <StatTile
              label="Envoyées"
              value={sent}
              sub={notSent > 0 ? `${notSent} restante(s)` : "Complet"}
              dotClass="bg-vodacom-red"
            />
            <StatTile
              label="Email"
              value={emailChannel}
              sub={messagingStatus.brevo ? "Brevo actif" : "Inactif"}
              dotClass="bg-zinc-400"
            />
            <StatTile
              label="WhatsApp"
              value={whatsappChannel}
              sub={messagingStatus.twilioWhatsapp ? "Twilio actif" : "Inactif"}
              dotClass="bg-vodacom-red/60"
            />
          </ul>
          <p className="mt-4 shrink-0 text-center text-xs text-zinc-400">
            <span className="font-semibold text-vodacom-red">{sendable}</span> invité
            {sendable !== 1 ? "s" : ""} prêt{sendable !== 1 ? "s" : ""} à l&apos;envoi
          </p>
        </>
      )}
    </AdminPanel>
  );
}
