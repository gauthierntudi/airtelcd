import { RsvpStatus } from "@prisma/client";
import { guestSalutationPrefix } from "@/lib/event";

const CONFIRMED_SUBLINE =
  "Présentez le QR code à l'accueil le jour de l'événement.";

function confirmedHeadline(prefix: string): string {
  return `${prefix}votre présence est confirmée`;
}

/** Texte principal — slide RSVP mobile / en-tête desktop. */
export function invitationRsvpSlideHeadline(
  fullName: string | null,
  status: RsvpStatus,
): string {
  const prefix = guestSalutationPrefix(fullName);
  if (status === RsvpStatus.CONFIRMED) {
    return confirmedHeadline(prefix);
  }
  return `${prefix}confirmez votre présence`;
}

/** Sous-texte — slide RSVP mobile. */
export function invitationRsvpSlideSubline(status: RsvpStatus): string {
  if (status === RsvpStatus.CONFIRMED) {
    return CONFIRMED_SUBLINE;
  }
  return "Utilisez le bouton ci-dessous pour répondre — puis présentez votre QR code à l'accueil.";
}

export function invitationPassHeadline(
  fullName: string | null,
  status: RsvpStatus,
): string {
  const prefix = guestSalutationPrefix(fullName);
  if (status === RsvpStatus.CONFIRMED) {
    return confirmedHeadline(prefix);
  }
  return `${prefix}votre place VIP vous attend`;
}

export function invitationPassSubline(status: RsvpStatus): string {
  if (status === RsvpStatus.CONFIRMED) {
    return CONFIRMED_SUBLINE;
  }
  return "Conservez cette invitation et présentez le QR code à l'accueil le jour de l'événement.";
}
