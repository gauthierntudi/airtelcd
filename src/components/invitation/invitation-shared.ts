import type { RsvpStatus } from "@prisma/client";
import type { InvitationGuestView } from "@/lib/load-invitation-guest";

export const INVITATION_HERO_IMAGES = [
  "/img/img-01.jpg",
  "/img/img-02.jpg",
  "/img/img-03.jpg",
  "/img/img-04.jpg",
] as const;

export type InvitationHeroImage = (typeof INVITATION_HERO_IMAGES)[number];

export function pickInvitationHeroImage(
  exclude?: string,
): InvitationHeroImage {
  const pool = INVITATION_HERO_IMAGES.filter((src) => src !== exclude);
  const options = pool.length > 0 ? pool : INVITATION_HERO_IMAGES;
  return options[Math.floor(Math.random() * options.length)]!;
}

export const INVITATION_RSVP_UI: Record<
  RsvpStatus,
  { label: string; className: string; dot: string }
> = {
  PENDING: {
    label: "En attente",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    label: "Confirmé",
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  DECLINED: {
    label: "Décliné",
    className: "bg-zinc-100 text-zinc-600 ring-zinc-200",
    dot: "bg-zinc-400",
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
  onDownloadInvitation: () => void | Promise<void>;
  downloadingInvitation: boolean;
  onConfirm: () => void;
  onDecline: () => void;
};
