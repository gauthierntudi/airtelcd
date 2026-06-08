import type { Guest } from "@prisma/client";
import { guestDisplayName } from "@/lib/event";
import { eventDaysFromDbDates } from "@/lib/parse-event-day";
import { guestInvitationTimeRange } from "@/lib/invitation-time-range";
import {
  formatInvitationTemplateDates,
  type InvitationEmailVariant,
} from "@/lib/messaging/invitation-email-vars";

/**
 * Variables Twilio Content pour les templates WhatsApp.
 *
 * Nominatif (HX5f6dad7…): {{1}} nom, {{2}} dates, {{3}} horaire, {{4}} token
 * Simple (HX4048c5…): {{1}} dates, {{2}} horaire, {{3}} token
 * URL fixe dans le template : …/api/confirm/action={{n}}
 */
export function buildInvitationWhatsAppVariables(
  guest: Guest,
  variant: InvitationEmailVariant,
): Record<string, string> {
  const eventDays = eventDaysFromDbDates(guest.eventDays);
  const dates = formatInvitationTemplateDates(eventDays);
  const time = guestInvitationTimeRange(guest);
  const token = guest.token;

  if (variant === "nominative") {
    return {
      "1": guestDisplayName(guest.fullName),
      "2": dates,
      "3": time,
      "4": token,
    };
  }

  return {
    "1": dates,
    "2": time,
    "3": token,
  };
}
