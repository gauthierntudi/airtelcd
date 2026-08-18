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

export type EventDayId = string;

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

/** Grille d’un mois (semaine commence lundi), jours invités marqués. */
export function buildMonthCalendarCells(
  year: number,
  month: number,
  invitedDayIds: EventDayId[] = [],
): CalendarMonthCell[] {
  const invitedSet = new Set(invitedDayIds);
  const monthIndex = month - 1;
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: CalendarMonthCell[] = [];
  const mm = String(month).padStart(2, "0");

  for (let i = 0; i < mondayOffset; i++) {
    cells.push({ kind: "pad", key: `pad-${i}` });
  }

  for (let date = 1; date <= daysInMonth; date++) {
    const iso = `${year}-${mm}-${String(date).padStart(2, "0")}` as EventDayId;
    const isEventDay = invitedSet.has(iso);
    cells.push({
      kind: "day",
      key: iso,
      date,
      dayId: iso,
      isEventDay,
    });
  }

  return cells;
}

/** Semaine(s) lundi–dimanche qui couvrent les jours invités. */
export function buildInvitedWeekCalendarCells(
  invitedDayIds: EventDayId[],
  anchorDayId?: EventDayId,
): CalendarMonthCell[] {
  const invitedSet = new Set(invitedDayIds);
  const anchors =
    invitedDayIds.length > 0
      ? invitedDayIds
      : anchorDayId
        ? [anchorDayId]
        : [];
  const mondayKeys = new Set<string>();

  for (const id of anchors) {
    const d = new Date(`${id}T12:00:00.000Z`);
    if (Number.isNaN(d.getTime())) continue;
    const offset = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - offset);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    mondayKeys.add(`${y}-${m}-${day}`);
  }

  const cells: CalendarMonthCell[] = [];
  for (const mondayIso of [...mondayKeys].sort()) {
    const monday = new Date(`${mondayIso}T12:00:00.000Z`);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      const iso = `${y}-${m}-${day}` as EventDayId;
      cells.push({
        kind: "day",
        key: iso,
        date: d.getUTCDate(),
        dayId: iso,
        isEventDay: invitedSet.has(iso),
      });
    }
  }

  return cells;
}

/** Grille juin 2026 (semaine commence lundi) */
export function buildEventMonthCalendarCells(): CalendarMonthCell[] {
  return buildMonthCalendarCells(
    EVENT_CALENDAR.year,
    EVENT_CALENDAR.month,
    EVENT_DAY_IDS,
  );
}

export function getEventDayById(id: EventDayId) {
  const known = EVENT_DAYS.find((d) => d.id === id);
  if (known) return known;
  const day = Number(id.slice(8, 10)) || 0;
  return {
    id,
    day,
    weekday: "",
    label: id,
    pillLabel: String(day || id),
  };
}

export function formatInvitedDayLong(dayId: EventDayId): string {
  const known = EVENT_DAYS.find((d) => d.id === dayId);
  if (known) return `${known.weekday} ${known.label}`;
  const d = new Date(`${dayId}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return dayId;
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatInvitedDayShort(dayId: EventDayId): string {
  return getEventDayById(dayId).label;
}

/** Liste lisible pour 1 à n jours — ex. « Vendredi 12 juin », « 12 et 13 juin » */
export function formatInvitedDaysLong(dayIds: EventDayId[]): string {
  const sorted = [...new Set(dayIds)].sort();
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
  const sorted = [...new Set(dayIds)].sort();
  if (sorted.length <= 1) {
    return sorted[0] ? formatInvitedDayShort(sorted[0]) : formatInvitedDayShort(DEFAULT_EVENT_DAY_ID);
  }
  return sorted.map((id) => getEventDayById(id).label).join(", ");
}
