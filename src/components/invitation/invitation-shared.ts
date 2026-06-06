import type { RsvpStatus } from "@prisma/client";
import type { InvitationGuestView } from "@/lib/load-invitation-guest";

export const INVITATION_RSVP_UI: Record<
  RsvpStatus,
  { label: string; className: string; dot: string }
> = {
  PENDING: {
    label: "En attente",
    className: "bg-amber-500/20 text-amber-100 ring-amber-400/40",
    dot: "bg-amber-400",
  },
  CONFIRMED: {
    label: "Confirmé",
    className: "bg-emerald-500/20 text-emerald-100 ring-emerald-400/40",
    dot: "bg-emerald-400",
  },
  DECLINED: {
    label: "Décliné",
    className: "bg-white/15 text-white/80 ring-white/20",
    dot: "bg-white/50",
  },
};

export type InvitationSharedProps = {
  guest: InvitationGuestView;
  /** Nom complet invité — `null` si non renseigné en base (textes génériques). */
  displayName: string | null;
  status: RsvpStatus;
  confirmedAt: string | null;
  loading: boolean;
  invitationUrl: string;
  qrImageUrl: string;
  googleCalendarUrl: string;
  icsDownloadUrl: string;
  onConfirm: () => void;
  onDecline: () => void;
};
