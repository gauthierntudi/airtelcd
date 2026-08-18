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
import type { GuestRow } from "@/lib/guest-types";
import type { InvitationSentVia } from "@/lib/messaging/send-invitation";
import { guestAdminDisplayName } from "@/lib/event";
import { dateToIsoDay } from "@/lib/events";
import { guestInvitationTimeRange } from "@/lib/invitation-time-range";
import { invitationAbsoluteUrl } from "@/lib/invitation-url";

function asInvitationSentVia(v: string | null): InvitationSentVia | null {
  if (v === "email" || v === "whatsapp" || v === "both") return v;
  return null;
}

export const guestEventInclude = {
  event: { select: { id: true, name: true, startDate: true, endDate: true } },
} as const;

export type GuestWithEvent = Guest & {
  event?: { id: string; name: string; startDate: Date; endDate: Date } | null;
};

export function serializeGuest(g: GuestWithEvent, baseUrl: string): GuestRow {
  return {
    id: g.id,
    fullName: g.fullName,
    email: g.email,
    phone: g.phone,
    token: g.token,
    eventId: g.eventId ?? null,
    eventName: g.event?.name ?? null,
    eventDate: g.event ? dateToIsoDay(g.event.startDate) : null,
    eventEndDate: g.event ? dateToIsoDay(g.event.endDate) : null,
    eventDays: eventDaysFromDbDates(g.eventDays),
    invitationTimeRange: guestInvitationTimeRange(g),
    rsvpStatus: g.rsvpStatus,
    confirmedAt: g.confirmedAt?.toISOString() ?? null,
    invitationSentAt: g.invitationSentAt?.toISOString() ?? null,
    invitationSentVia: asInvitationSentVia(g.invitationSentVia),
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
    displayName: guestAdminDisplayName(g),
    invitationUrl: invitationAbsoluteUrl(g.token, baseUrl),
    contactChannels: getGuestContactChannels(g),
    sendChannels: getSendableMessageChannels(g),
    messageChannel: getPreferredMessageChannel(g),
    canSendInvitation: canSendInvitationToGuest(g),
  };
}
