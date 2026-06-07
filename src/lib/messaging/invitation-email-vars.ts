import type { Guest } from "@prisma/client";
import { guestDisplayName } from "@/lib/event";
import type { EventDayId } from "@/lib/event-days";
import { eventDaysFromDbDates } from "@/lib/parse-event-day";
import { invitationAbsoluteUrl } from "@/lib/invitation-url";
import { guestInvitationTimeRange } from "@/lib/invitation-time-range";

export const INVITATION_EXPERIENCE = {
  title: "Kinshasa Open de Golf",
  venue: "Green Bistro/Cercle de Kinshasa",
  organizer: "Vodacom Privilège",
} as const;

export type InvitationEmailVariant = "simple" | "nominative";

/** Jours pour le template — ex. « 12 et 13 », « 12 », « 12, 13 et 14 » */
export function formatInvitationTemplateDates(dayIds: EventDayId[]): string {
  const order = new Map<EventDayId, number>([
    ["2026-06-12", 12],
    ["2026-06-13", 13],
    ["2026-06-14", 14],
  ]);
  const nums = [...new Set(dayIds)]
    .sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0))
    .map((id) => order.get(id)!)
    .filter(Boolean);

  if (nums.length === 0) return "12";
  if (nums.length === 1) return String(nums[0]);
  if (nums.length === 2) return `${nums[0]} et ${nums[1]}`;
  const last = nums[nums.length - 1]!;
  return `${nums.slice(0, -1).join(", ")} et ${last}`;
}

export type InvitationEmailRenderParams = {
  variant: InvitationEmailVariant;
  displayName: string;
  eventDates: string;
  eventTime: string;
  venue: string;
  invitationUrl: string;
  token: string;
};

export function buildInvitationEmailParams(
  guest: Guest,
  _baseUrl: string,
  variant: InvitationEmailVariant,
): InvitationEmailRenderParams {
  const eventDays = eventDaysFromDbDates(guest.eventDays);
  return {
    variant,
    displayName: guestDisplayName(guest.firstName, guest.lastName),
    eventDates: formatInvitationTemplateDates(eventDays),
    eventTime: guestInvitationTimeRange(guest),
    venue: INVITATION_EXPERIENCE.venue,
    /** Même URL pour le bouton « Confirmez » et le contenu encodé dans le QR */
    invitationUrl: invitationAbsoluteUrl(guest.token),
    token: guest.token,
  };
}
