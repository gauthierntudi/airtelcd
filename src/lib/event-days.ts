/** Jours de l'événement — 12, 13 et 14 juin 2026 */
export const EVENT_DAYS = [
  {
    id: "2026-06-12",
    day: 12,
    weekday: "Vendredi",
    label: "12 juin",
    pillLabel: "12",
  },
  {
    id: "2026-06-13",
    day: 13,
    weekday: "Samedi",
    label: "13 juin",
    pillLabel: "13",
  },
  {
    id: "2026-06-14",
    day: 14,
    weekday: "Dimanche",
    label: "14 juin",
    pillLabel: "14",
  },
] as const;

export type EventDayId = (typeof EVENT_DAYS)[number]["id"];

export const DEFAULT_EVENT_DAY_ID: EventDayId = "2026-06-12";

export const EVENT_DAY_IDS = EVENT_DAYS.map((d) => d.id) as EventDayId[];

export const EVENT_CALENDAR = {
  year: 2026,
  month: 6,
  monthLabel: "Juin 2026",
} as const;

export const CALENDAR_WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"] as const;

export type CalendarMonthCell =
  | { kind: "pad"; key: string }
  | {
      kind: "day";
      key: string;
      date: number;
      dayId: EventDayId | null;
      isEventDay: boolean;
    };

/** Grille juin 2026 (semaine commence lundi) */
export function buildEventMonthCalendarCells(): CalendarMonthCell[] {
  const { year, month } = EVENT_CALENDAR;
  const monthIndex = month - 1;
  const first = new Date(year, monthIndex, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: CalendarMonthCell[] = [];

  for (let i = 0; i < mondayOffset; i++) {
    cells.push({ kind: "pad", key: `pad-${i}` });
  }

  for (let date = 1; date <= daysInMonth; date++) {
    const iso = `${year}-06-${String(date).padStart(2, "0")}` as EventDayId;
    const isEventDay = EVENT_DAY_IDS.includes(iso);
    cells.push({
      kind: "day",
      key: iso,
      date,
      dayId: isEventDay ? iso : null,
      isEventDay,
    });
  }

  return cells;
}

export function getEventDayById(id: EventDayId) {
  return EVENT_DAYS.find((d) => d.id === id)!;
}

export function formatInvitedDayLong(dayId: EventDayId): string {
  const d = getEventDayById(dayId);
  return `${d.weekday} ${d.label}`;
}

export function formatInvitedDayShort(dayId: EventDayId): string {
  return getEventDayById(dayId).label;
}

/** Liste lisible pour 1 à n jours — ex. « Vendredi 12 juin », « 12 et 13 juin » */
export function formatInvitedDaysLong(dayIds: EventDayId[]): string {
  const sorted = [...new Set(dayIds)].sort(
    (a, b) =>
      EVENT_DAYS.findIndex((d) => d.id === a) -
      EVENT_DAYS.findIndex((d) => d.id === b),
  );
  if (sorted.length === 0) return formatInvitedDayLong(DEFAULT_EVENT_DAY_ID);
  if (sorted.length === 1) return formatInvitedDayLong(sorted[0]);
  if (sorted.length === 2) {
    return `${formatInvitedDayLong(sorted[0])} et ${formatInvitedDayLong(sorted[1])}`;
  }
  const last = sorted[sorted.length - 1];
  const rest = sorted.slice(0, -1).map((id) => formatInvitedDayLong(id));
  return `${rest.join(", ")} et ${formatInvitedDayLong(last)}`;
}

export function formatInvitedDaysShort(dayIds: EventDayId[]): string {
  const sorted = [...new Set(dayIds)].sort(
    (a, b) =>
      EVENT_DAYS.findIndex((d) => d.id === a) -
      EVENT_DAYS.findIndex((d) => d.id === b),
  );
  if (sorted.length <= 1) {
    return sorted[0] ? formatInvitedDayShort(sorted[0]) : formatInvitedDayShort(DEFAULT_EVENT_DAY_ID);
  }
  return sorted.map((id) => getEventDayById(id).label).join(", ");
}
