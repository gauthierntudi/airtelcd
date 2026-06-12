import { EVENT_DAY_IDS, type EventDayId } from "@/lib/event-days";

const CHECKIN_TIMEZONE = "Africa/Kinshasa";
/** Kinshasa — UTC+1 fixe */
const KINSHASA_UTC_OFFSET = "+01:00";

/** Jour d'événement (12/13/14 juin) auquel correspond un check-in. */
export function checkedInAtToEventDayId(checkedInAt: Date): EventDayId | null {
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: CHECKIN_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(checkedInAt);

  return EVENT_DAY_IDS.includes(iso as EventDayId) ? (iso as EventDayId) : null;
}

/** Bornes UTC [gte, lt) pour filtrer les check-ins d'un jour d'événement. */
export function checkinDayUtcBounds(eventDayId: EventDayId): {
  gte: Date;
  lt: Date;
} {
  const idx = EVENT_DAY_IDS.indexOf(eventDayId);
  const gte = new Date(`${eventDayId}T00:00:00${KINSHASA_UTC_OFFSET}`);
  const nextDayId = EVENT_DAY_IDS[idx + 1];
  const lt = nextDayId
    ? new Date(`${nextDayId}T00:00:00${KINSHASA_UTC_OFFSET}`)
    : new Date(`2026-06-15T00:00:00${KINSHASA_UTC_OFFSET}`);

  return { gte, lt };
}
