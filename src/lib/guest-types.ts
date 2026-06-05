import { RsvpStatus } from "@prisma/client";
import type { ContactChannel } from "@/lib/guest-contact";
import type { EventDayId } from "@/lib/event-days";

/** Ordre aligné sur le modèle Guest / export CSV / tableau admin */
export type GuestRow = {
  id: string;
  firstName: string;
  lastName: string;
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

/** Export CSV — mêmes colonnes que le modèle d'import */
export function guestsToCsv(rows: GuestRow[]): string {
  const header = ["prenom", "nom", "email", "telephone"];
  const lines = rows.map((g) =>
    [g.firstName, g.lastName, g.email ?? "", g.phone ?? ""]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
