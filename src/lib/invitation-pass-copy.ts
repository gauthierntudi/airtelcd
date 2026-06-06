import { RsvpStatus } from "@prisma/client";
import { guestSalutationPrefix } from "@/lib/event";

export function invitationPassHeadline(
  firstName: string | null,
  status: RsvpStatus,
): string {
  const prefix = guestSalutationPrefix(firstName);
  if (status === RsvpStatus.CONFIRMED) {
    return `${prefix}votre présence est confirmée`;
  }
  return `${prefix}votre place VIP vous attend`;
}

export function invitationPassSubline(status: RsvpStatus): string {
  if (status === RsvpStatus.CONFIRMED) {
    return "Présentez le QR code à l'accueil le jour de l'événement.";
  }
  return "Conservez cette invitation et présentez le QR code à l'accueil le jour de l'événement.";
}
