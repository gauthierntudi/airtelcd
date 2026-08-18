import { RsvpStatus } from "@prisma/client";
import { EVENT } from "@/lib/event";
import type { EventDayId } from "@/lib/event-days";
import {
  DEFAULT_EVENT_TIME_RANGE,
  dateToIsoDay,
  googleMapsSearchUrl,
  isoDaysInRange,
  parseDayTimesJson,
  parseFrTimeRange,
  type DaySchedule,
} from "@/lib/events";
import { guestInvitationTimeRange } from "@/lib/invitation-time-range";
import { eventDaysFromDbDates } from "@/lib/parse-event-day";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export type InvitationEventView = {
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  mapsUrl: string;
  contactEmail: string;
  contactPhone: string;
  organizer: string;
  dayTimes: Record<string, DaySchedule>;
  timeRange: string;
};

export type InvitationGuestView = {
  fullName: string | null;
  token: string;
  eventDays: EventDayId[];
  invitationTimeRange: string;
  rsvpStatus: RsvpStatus;
  confirmedAt: string | null;
  event: InvitationEventView;
};

export async function loadInvitationGuestByToken(
  token: string,
): Promise<InvitationGuestView> {
  const guest = await prisma.guest.findUnique({
    where: { token },
    include: { event: true },
  });
  if (!guest) notFound();

  const eventDays = eventDaysFromDbDates(guest.eventDays);
  const invitationTimeRange = guestInvitationTimeRange(guest);

  return {
    fullName: guest.fullName,
    token: guest.token,
    eventDays,
    invitationTimeRange,
    rsvpStatus: guest.rsvpStatus,
    confirmedAt: guest.confirmedAt?.toISOString() ?? null,
    event: invitationEventView(guest.event, eventDays, invitationTimeRange),
  };
}

function invitationEventView(
  event: {
    name: string;
    startDate: Date;
    endDate: Date;
    venue: string;
    timeRange: string;
    dayTimes: unknown;
  } | null,
  eventDays: EventDayId[],
  invitationTimeRange: string,
): InvitationEventView {
  const fallbackRange = invitationTimeRange || DEFAULT_EVENT_TIME_RANGE;

  if (event) {
    const startDate = dateToIsoDay(event.startDate);
    const endDate = dateToIsoDay(event.endDate);
    const venue = event.venue.trim();
    return {
      name: event.name,
      startDate,
      endDate,
      venue,
      mapsUrl: venue ? googleMapsSearchUrl(venue) : EVENT.mapsUrl,
      contactEmail: EVENT.contactEmail,
      contactPhone: EVENT.contactPhone,
      organizer: EVENT.organizer,
      timeRange: event.timeRange,
      dayTimes: parseDayTimesJson(
        event.dayTimes,
        event.timeRange,
        isoDaysInRange(startDate, endDate),
      ),
    };
  }

  const startDate = eventDays[0] ?? dateToIsoDay(new Date());
  const endDate = eventDays[eventDays.length - 1] ?? startDate;
  const fallback = parseFrTimeRange(fallbackRange);
  const days = eventDays.length > 0 ? eventDays : [startDate];

  return {
    name: EVENT.title,
    startDate,
    endDate,
    venue: EVENT.venue,
    mapsUrl: EVENT.mapsUrl,
    contactEmail: EVENT.contactEmail,
    contactPhone: EVENT.contactPhone,
    organizer: EVENT.organizer,
    timeRange: fallbackRange,
    dayTimes: Object.fromEntries(days.map((day) => [day, { ...fallback }])),
  };
}
