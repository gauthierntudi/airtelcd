import { EVENT_DAY_IDS, formatInvitedDaysLong, type EventDayId } from "@/lib/event-days";
import { eventDaysFromDbDates } from "@/lib/parse-event-day";

const CHECKIN_TIMEZONE = "Africa/Kinshasa";

/** Jour d'événement courant (12, 13 ou 14 juin 2026) selon l'heure de Kinshasa. */
export function getCurrentEventDayId(now = new Date()): EventDayId | null {
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: CHECKIN_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return EVENT_DAY_IDS.includes(iso as EventDayId) ? (iso as EventDayId) : null;
}

export type GuestCheckInDayResult =
  | { allowed: true; today: EventDayId }
  | { allowed: false; message: string };

/** Vérifie si l'invité peut faire le check-in physique aujourd'hui. */
export function evaluateGuestCheckInDay(
  guestEventDays: Date[],
  now = new Date(),
): GuestCheckInDayResult {
  const today = getCurrentEventDayId(now);
  if (!today) {
    return {
      allowed: false,
      message:
        "Le check-in n'est pas ouvert aujourd'hui. Revenez un jour de l'événement (12, 13 ou 14 juin).",
    };
  }

  const invitedDays = eventDaysFromDbDates(guestEventDays);
  if (invitedDays.includes(today)) {
    return { allowed: true, today };
  }

  return {
    allowed: false,
    message: `Votre invitation est prévue pour ${formatInvitedDaysLong(invitedDays)}. Le check-in n'est pas disponible aujourd'hui.`,
  };
}

export function assertGuestCheckInDayAllowed(
  guestEventDays: Date[],
  now = new Date(),
): void {
  const result = evaluateGuestCheckInDay(guestEventDays, now);
  if (!result.allowed) {
    throw new Error(result.message);
  }
}
