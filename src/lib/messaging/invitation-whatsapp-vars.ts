import type { Guest } from "@prisma/client";
import { EVENT_DAY_IDS, type EventDayId } from "@/lib/event-days";
import { guestInvitationTimeRange } from "@/lib/invitation-time-range";
import { formatInvitationTemplateDates } from "@/lib/messaging/invitation-email-vars";
import { eventDaysFromDbDates, sortEventDayIds } from "@/lib/parse-event-day";

/** Template WhatsApp — 1 jour (3 variables) ou 3 jours (token seul). */
export type InvitationWhatsAppTemplate = "one_day" | "three_days";

const ALL_EVENT_DAYS: EventDayId[] = [...EVENT_DAY_IDS];

/**
 * Variables Twilio Content pour les templates WhatsApp.
 *
 * 1 jour (SIMPLE_SID) — {{1}} date, {{2}} horaire, {{3}} token
 * URL dans le template : …/api/confirm/action={{3}}
 *
 * 3 jours (NOMINATIVE_SID) — {{1}} token
 * Dates/horaires fixes dans le template Twilio
 * URL : …/api/confirm/action={{1}}
 */
export function resolveInvitationWhatsAppTemplate(
  guest: Guest,
): InvitationWhatsAppTemplate {
  const eventDays = sortEventDayIds(eventDaysFromDbDates(guest.eventDays));
  const hasAllThree =
    eventDays.length === 3 &&
    ALL_EVENT_DAYS.every((id) => eventDays.includes(id));
  return hasAllThree ? "three_days" : "one_day";
}

/** Horaire WhatsApp — « 14h00 à 19h00 » (le template utilise « De {{2}} »). */
export function formatWhatsAppInvitationTime(time: string): string {
  return time.replace(/\s*[–—-]\s*/g, " à ");
}

export function buildInvitationWhatsAppVariables(
  guest: Guest,
  template: InvitationWhatsAppTemplate,
): Record<string, string> {
  const token = guest.token;

  if (template === "three_days") {
    return { "1": token };
  }

  const eventDays = eventDaysFromDbDates(guest.eventDays);
  const dates = formatInvitationTemplateDates(eventDays);
  const time = formatWhatsAppInvitationTime(guestInvitationTimeRange(guest));

  return {
    "1": dates,
    "2": time,
    "3": token,
  };
}
