import type { Guest } from "@prisma/client";
import {
  getGuestContactChannels,
  getPreferredMessageChannel,
} from "@/lib/guest-contact";
import { eventDaysFromDbDates } from "@/lib/parse-event-day";
import {
  canSendInvitationToGuest,
  getSendableMessageChannels,
} from "@/lib/messaging/config";
import type { ContactChannel } from "@/lib/guest-contact";
import type { GuestRow } from "@/lib/guest-types";
import type { InvitationSentVia } from "@/lib/messaging/send-invitation";
import { guestInvitationTimeRange } from "@/lib/invitation-time-range";
import { invitationAbsoluteUrl } from "@/lib/invitation-url";

function asInvitationSentVia(v: string | null): InvitationSentVia | null {
  if (v === "email" || v === "whatsapp" || v === "both") return v;
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
    invitationTimeRange: guestInvitationTimeRange(g),
    rsvpStatus: g.rsvpStatus,
    confirmedAt: g.confirmedAt?.toISOString() ?? null,
    invitationSentAt: g.invitationSentAt?.toISOString() ?? null,
    invitationSentVia: asInvitationSentVia(g.invitationSentVia),
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
    displayName: `${g.firstName} ${g.lastName}`.trim(),
    invitationUrl: invitationAbsoluteUrl(g.token, baseUrl),
    contactChannels: getGuestContactChannels(g),
    sendChannels: getSendableMessageChannels(g),
    messageChannel: getPreferredMessageChannel(g),
    canSendInvitation: canSendInvitationToGuest(g),
  };
}
