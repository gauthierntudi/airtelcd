import { RsvpStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import type { EventDayId } from "@/lib/event-days";
import { eventDaysFromDbDates } from "@/lib/parse-event-day";
import { guestInvitationTimeRange } from "@/lib/invitation-time-range";
import { prisma } from "@/lib/prisma";

export type InvitationGuestView = {
  fullName: string | null;
  token: string;
  eventDays: EventDayId[];
  invitationTimeRange: string;
  rsvpStatus: RsvpStatus;
  confirmedAt: string | null;
};

export async function loadInvitationGuestByToken(
  token: string,
): Promise<InvitationGuestView> {
  const guest = await prisma.guest.findUnique({ where: { token } });
  if (!guest) notFound();

  return {
    fullName: guest.fullName,
    token: guest.token,
    eventDays: eventDaysFromDbDates(guest.eventDays),
    invitationTimeRange: guestInvitationTimeRange(guest),
    rsvpStatus: guest.rsvpStatus,
    confirmedAt: guest.confirmedAt?.toISOString() ?? null,
  };
}
