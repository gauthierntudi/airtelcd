import { EVENT_DAY_IDS, formatInvitedDaysShort, type EventDayId } from "@/lib/event-days";
import { sortEventDayIds } from "@/lib/parse-event-day";

/** Filtre admin — lots d'invitation (correspondance exacte des jours en base). */
export type GuestEventDayLotId =
  | "ALL"
  | "2026-06-12"
  | "2026-06-13"
  | "2026-06-14"
  | "2026-06-12-13-14";

export const GUEST_EVENT_DAY_LOTS: {
  id: GuestEventDayLotId;
  label: string;
  eventDays: EventDayId[] | null;
}[] = [
  { id: "ALL", label: "Tous les lots", eventDays: null },
  {
    id: "2026-06-12",
    label: "12 juin",
    eventDays: ["2026-06-12"],
  },
  {
    id: "2026-06-13",
    label: "13 juin",
    eventDays: ["2026-06-13"],
  },
  {
    id: "2026-06-14",
    label: "14 juin",
    eventDays: ["2026-06-14"],
  },
  {
    id: "2026-06-12-13-14",
    label: "12, 13 et 14 juin",
    eventDays: [...EVENT_DAY_IDS],
  },
];

export function sameEventDaySet(a: EventDayId[], b: EventDayId[]): boolean {
  const sa = sortEventDayIds(a);
  const sb = sortEventDayIds(b);
  if (sa.length !== sb.length) return false;
  return sa.every((id, i) => id === sb[i]);
}

export function guestMatchesEventDayLot(
  guestDays: EventDayId[],
  lotId: GuestEventDayLotId,
): boolean {
  if (lotId === "ALL") return true;
  const lot = GUEST_EVENT_DAY_LOTS.find((l) => l.id === lotId);
  if (!lot?.eventDays) return true;
  return sameEventDaySet(guestDays, lot.eventDays);
}

export function getGuestEventDayLotLabel(lotId: GuestEventDayLotId): string {
  return GUEST_EVENT_DAY_LOTS.find((l) => l.id === lotId)?.label ?? "Tous les lots";
}

export function formatGuestEventDayLotShort(eventDays: EventDayId[]): string {
  return formatInvitedDaysShort(eventDays);
}
