import { RsvpStatus } from "@prisma/client";
import type { ContactChannel } from "@/lib/guest-contact";
import type { EventDayId } from "@/lib/event-days";

/** Ordre aligné sur le modèle Guest / export CSV / tableau admin */
export type GuestRow = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  token: string;
  eventDays: EventDayId[];
  invitationTimeRange: string;
  rsvpStatus: RsvpStatus;
  confirmedAt: string | null;
  invitationSentAt: string | null;
  invitationSentVia: ContactChannel | "both" | null;
  createdAt: string;
  updatedAt: string;
  displayName: string;
  invitationUrl: string;
  contactChannels: ContactChannel[];
  /** Canaux réellement envoyables (contact + API configurée) */
  sendChannels: ContactChannel[];
  messageChannel: ContactChannel | null;
  /** true seulement si contact + API Brevo/Twilio configurée pour ce canal */
  canSendInvitation: boolean;
};

export const RSVP_CONFIG: Record<
  RsvpStatus,
  { label: string; badge: string; dot: string }
> = {
  PENDING: {
    label: "En attente",
    badge: "bg-white/10 text-white ring-white/20",
    dot: "bg-white",
  },
  CONFIRMED: {
    label: "Confirmé",
    badge: "bg-vodacom-red text-white ring-vodacom-red",
    dot: "bg-vodacom-red",
  },
  DECLINED: {
    label: "Décliné",
    badge: "bg-white/5 text-white/50 ring-white/15",
    dot: "bg-vodacom-silver",
  },
};

export type RsvpFilter = "ALL" | RsvpStatus;

export function formatGuestDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function csvCell(value: string): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function invitationExportLabel(guest: GuestRow): string {
  return guest.invitationSentAt ? "Envoyée" : "Non envoyée";
}

/** Export CSV — colonnes du registre admin (Registre des participants) */
export function guestsToCsv(rows: GuestRow[]): string {
  const header = [
    "Invité",
    "RSVP",
    "Invitation",
    "Confirmé le",
    "Ajouté le",
  ];
  const lines = rows.map((g) =>
    [
      g.displayName,
      RSVP_CONFIG[g.rsvpStatus].label,
      invitationExportLabel(g),
      formatGuestDate(g.confirmedAt),
      formatGuestDate(g.createdAt),
    ]
      .map(csvCell)
      .join(","),
  );
  return [header.map(csvCell).join(","), ...lines].join("\n");
}
