import {
  DEFAULT_EVENT_DAY_ID,
  EVENT_DAY_IDS,
  EVENT_DAYS,
  type EventDayId,
} from "@/lib/event-days";

const DAY_NUM_TO_ID: Record<number, EventDayId> = {
  12: "2026-06-12",
  13: "2026-06-13",
  14: "2026-06-14",
};

function sortEventDayIds(ids: EventDayId[]): EventDayId[] {
  const order = new Map(EVENT_DAY_IDS.map((id, i) => [id, i]));
  return [...new Set(ids)].sort(
    (a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0),
  );
}

/** Valide et normalise 1 à n jours d'invitation. */
export function parseEventDaysInput(
  value: string | string[] | number | Date | null | undefined,
): { eventDays: EventDayId[] } | { error: string } {
  if (value === null || value === undefined || value === "") {
    return { eventDays: [DEFAULT_EVENT_DAY_ID] };
  }

  if (Array.isArray(value)) {
    const ids: EventDayId[] = [];
    for (const item of value) {
      const parsed = parseEventDaysInput(item);
      if ("error" in parsed) return parsed;
      ids.push(...parsed.eventDays);
    }
    const sorted = sortEventDayIds(ids);
    if (sorted.length === 0) {
      return { error: "Au moins un jour d'invitation requis" };
    }
    return { eventDays: sorted };
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const one = eventDayFromDbDate(value);
    return { eventDays: [one] };
  }

  const raw = String(value).trim().toLowerCase();

  if (raw.includes("-") && /^\d/.test(raw)) {
    const rangeParts = raw.split("-").map((s) => s.trim());
    if (rangeParts.length === 2) {
      const start = parseInt(rangeParts[0], 10);
      const end = parseInt(rangeParts[1], 10);
      if (!Number.isNaN(start) && !Number.isNaN(end) && start <= end) {
        const ids: EventDayId[] = [];
        for (let n = start; n <= end; n++) {
          if (DAY_NUM_TO_ID[n]) ids.push(DAY_NUM_TO_ID[n]);
        }
        const sorted = sortEventDayIds(ids);
        if (sorted.length > 0) return { eventDays: sorted };
      }
    }
  }

  const tokens = raw.split(/[,;/|]+/).map((t) => t.trim()).filter(Boolean);
  if (tokens.length > 1) {
    return parseEventDaysInput(tokens);
  }

  if (EVENT_DAY_IDS.includes(raw as EventDayId)) {
    return { eventDays: [raw as EventDayId] };
  }

  const dayNum = parseInt(raw.replace(/^0+/, ""), 10);
  if (dayNum >= 12 && dayNum <= 14 && DAY_NUM_TO_ID[dayNum]) {
    return { eventDays: [DAY_NUM_TO_ID[dayNum]] };
  }

  const frMatch = raw.match(/(\d{1,2})[\s/.-]+(?:0?6|juin)/i);
  if (frMatch) {
    const n = parseInt(frMatch[1], 10);
    if (DAY_NUM_TO_ID[n]) return { eventDays: [DAY_NUM_TO_ID[n]] };
  }

  return { error: "Jours invalides — utilisez 12, 13, 14 ou 12-14, 12,13" };
}

/** @deprecated Utiliser parseEventDaysInput */
export function parseEventDayInput(
  value: string | number | Date | null | undefined,
): { eventDay: EventDayId } | { error: string } {
  const result = parseEventDaysInput(value);
  if ("error" in result) return result;
  return { eventDay: result.eventDays[0] };
}

export function eventDayFromDbDate(date: Date): EventDayId {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const iso = `${y}-${m}-${d}`;
  if (EVENT_DAY_IDS.includes(iso as EventDayId)) {
    return iso as EventDayId;
  }
  return DEFAULT_EVENT_DAY_ID;
}

export function eventDaysFromDbDates(dates: Date[]): EventDayId[] {
  const ids = dates.map(eventDayFromDbDate);
  return sortEventDayIds(ids.length > 0 ? ids : [DEFAULT_EVENT_DAY_ID]);
}

export function eventDayToDbDate(dayId: EventDayId): Date {
  return new Date(`${dayId}T12:00:00.000Z`);
}

export function eventDaysToDbDates(dayIds: EventDayId[]): Date[] {
  return sortEventDayIds(dayIds).map(eventDayToDbDate);
}

export { sortEventDayIds };
