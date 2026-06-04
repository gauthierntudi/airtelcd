import type { Guest } from "@prisma/client";
import {
  getGuestContactChannels,
  getPreferredMessageChannel,
} from "@/lib/guest-contact";
import { eventDaysFromDbDates } from "@/lib/parse-event-day";
import { canSendInvitationToGuest } from "@/lib/messaging/config";
import type { ContactChannel } from "@/lib/guest-contact";
import type { GuestRow } from "@/lib/guest-types";
import { invitationAbsoluteUrl } from "@/lib/invitation-url";

function asContactChannel(v: string | null): ContactChannel | null {
  if (v === "email" || v === "whatsapp") return v;
  return null;
}

export function serializeGuest(g: Guest, baseUrl: string): GuestRow {
  return {
    id: g.id,
    firstName: g.firstName,
    lastName: g.lastName,
    email: g.email,
    phone: g.phone,
    token: g.token,
    eventDays: eventDaysFromDbDates(g.eventDays),
    rsvpStatus: g.rsvpStatus,
    confirmedAt: g.confirmedAt?.toISOString() ?? null,
    invitationSentAt: g.invitationSentAt?.toISOString() ?? null,
    invitationSentVia: asContactChannel(g.invitationSentVia),
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
    displayName: `${g.firstName} ${g.lastName}`.trim(),
    invitationUrl: invitationAbsoluteUrl(g.token, baseUrl),
    contactChannels: getGuestContactChannels(g),
    messageChannel: getPreferredMessageChannel(g),
    canSendInvitation: canSendInvitationToGuest(g),
  };
}
