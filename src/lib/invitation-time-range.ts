import {
  DEFAULT_EVENT_DAY_ID,
  getEventDayById,
  type EventDayId,
} from "@/lib/event-days";
import { sortEventDayIds } from "@/lib/parse-event-day";

/** Horaires par jour — email ({{2}}/{{3}}) et page invitation */
export const EVENT_DAY_INVITATION_TIME_RANGES: Record<EventDayId, string> = {
  "2026-06-12": "14h00 – 19h00",
  "2026-06-13": "15h00 – 21h00",
  "2026-06-14": "12h00 – 18h00",
};

/** Horaire par défaut (12 juin) — emails et WhatsApp 1 jour */
export const DEFAULT_INVITATION_TIME_RANGE =
  EVENT_DAY_INVITATION_TIME_RANGES[DEFAULT_EVENT_DAY_ID];

export const INVITATION_TIME_RANGE_MAX_LENGTH = 80;

/** Horaire(s) selon les jours sélectionnés — 1 jour : plage seule ; plusieurs : « 12 juin : … · 13 juin : … » */
export function invitationTimeRangeForEventDays(
  dayIds: EventDayId[],
): string {
  const sorted = sortEventDayIds(dayIds);
  if (sorted.length === 0) return DEFAULT_INVITATION_TIME_RANGE;
  if (sorted.length === 1) {
    return EVENT_DAY_INVITATION_TIME_RANGES[sorted[0]];
  }
  return sorted
    .map(
      (id) =>
        `${getEventDayById(id).label} : ${EVENT_DAY_INVITATION_TIME_RANGES[id]}`,
    )
    .join(" · ");
}

export function guestInvitationTimeRange(guest: {
  invitationTimeRange: string | null;
}): string {
  const trimmed = guest.invitationTimeRange?.trim();
  return trimmed || DEFAULT_INVITATION_TIME_RANGE;
}

export function parseInvitationTimeRangeInput(
  value: string | null | undefined,
  eventDays?: EventDayId[],
): { invitationTimeRange: string } | { error: string } {
  if (value === undefined || value === null) {
    return {
      invitationTimeRange: eventDays?.length
        ? invitationTimeRangeForEventDays(eventDays)
        : DEFAULT_INVITATION_TIME_RANGE,
    };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return {
      invitationTimeRange: eventDays?.length
        ? invitationTimeRangeForEventDays(eventDays)
        : DEFAULT_INVITATION_TIME_RANGE,
    };
  }

  if (trimmed.length > INVITATION_TIME_RANGE_MAX_LENGTH) {
    return {
      error: `Horaire trop long (max ${INVITATION_TIME_RANGE_MAX_LENGTH} caractères)`,
    };
  }

  return { invitationTimeRange: trimmed };
}
