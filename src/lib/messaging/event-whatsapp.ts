import { RsvpStatus, type Guest, type WhatsAppTemplateKind } from "@prisma/client";
import { dateToIsoDay, formatEventPeriodShort } from "@/lib/events";
import { guestDisplayName } from "@/lib/event";

/** Variables Twilio Content — {{1}} nom, {{2}} dates, {{3}} token */
export function buildEventWhatsAppVariables(
  guest: Guest,
  startDate: Date,
  endDate: Date,
): Record<string, string> {
  return {
    "1": guestDisplayName(guest.fullName),
    "2": formatEventPeriodShort(
      dateToIsoDay(startDate),
      dateToIsoDay(endDate),
    ),
    "3": guest.token,
  };
}

export function guestsEligibleForTemplateKind(
  guests: Guest[],
  kind: WhatsAppTemplateKind,
): Guest[] {
  const withPhone = guests.filter((g) => Boolean(g.phone?.trim()));
  if (kind === "CONFIRMATION" || kind === "THANK_YOU") {
    return withPhone.filter((g) => g.rsvpStatus === RsvpStatus.CONFIRMED);
  }
  if (kind === "REMINDER") {
    return withPhone.filter((g) => g.rsvpStatus !== RsvpStatus.DECLINED);
  }
  return withPhone;
}

export function formatWhatsAppTimeRange(time: string): string {
  return time.replace(/\s*[–—-]\s*/g, " à ");
}
