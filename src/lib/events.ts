import type { Event, EventWhatsAppTemplate, WhatsAppTemplateKind } from "@prisma/client";

export const WHATSAPP_TEMPLATE_KINDS = [
  "INVITATION",
  "CONFIRMATION",
  "REMINDER",
  "THANK_YOU",
  "CUSTOM",
] as const satisfies readonly WhatsAppTemplateKind[];

export const WHATSAPP_TEMPLATE_KIND_META: Record<
  WhatsAppTemplateKind,
  { label: string; hint: string; badge: string }
> = {
  INVITATION: {
    label: "Invitation",
    hint: "Envoi initial — {{1}} nom, {{2}} dates, {{3}} token",
    badge: "bg-red-50 text-vodacom-red ring-1 ring-vodacom-red/25",
  },
  CONFIRMATION: {
    label: "Confirmation",
    hint: "Après RSVP confirmé — destinataires confirmés",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  REMINDER: {
    label: "Rappel",
    hint: "Relance avant l'événement — en attente + confirmés",
    badge: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  },
  THANK_YOU: {
    label: "Remerciement",
    hint: "Après l'événement — destinataires confirmés",
    badge: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
  },
  CUSTOM: {
    label: "Autre",
    hint: "Template libre (nommez-le, ex. Rappel J-1)",
    badge: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200",
  },
};

export type EventTemplateRow = {
  id: string;
  kind: WhatsAppTemplateKind;
  label: string;
  contentSid: string;
  createdAt: string;
  updatedAt: string;
};

export const DEFAULT_EVENT_TIME_RANGE = "14h00 – 19h00";

export type DaySchedule = { start: string; end: string };

export type EventRow = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  timeRange: string;
  dayTimes: Record<string, DaySchedule>;
  guestCount: number;
  templates: EventTemplateRow[];
  createdAt: string;
  updatedAt: string;
};

export type EventSummary = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  timeRange: string;
  guestCount: number;
};

export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
}

export function dateToIsoDay(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isoDayToUtcDate(iso: string): Date {
  return new Date(`${iso}T12:00:00.000Z`);
}

export function formatEventDateLong(iso: string): string {
  return isoDayToUtcDate(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatEventDateShort(iso: string): string {
  return isoDayToUtcDate(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatEventPeriod(startIso: string, endIso: string): string {
  if (startIso === endIso) return formatEventDateLong(startIso);
  return `Du ${formatEventDateShort(startIso)} au ${formatEventDateLong(endIso)}`;
}

export function formatEventPeriodShort(startIso: string, endIso: string): string {
  if (startIso === endIso) return formatEventDateShort(startIso);
  return `${formatEventDateShort(startIso)} – ${formatEventDateShort(endIso)}`;
}

export function isoDateParts(iso: string) {
  const d = isoDayToUtcDate(iso);
  return {
    weekday: d.toLocaleDateString("fr-FR", { weekday: "short", timeZone: "UTC" }),
    weekdayLong: d.toLocaleDateString("fr-FR", {
      weekday: "long",
      timeZone: "UTC",
    }),
    day: d.getUTCDate(),
    month: d.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" }),
    monthLong: d.toLocaleDateString("fr-FR", { month: "long", timeZone: "UTC" }),
    year: d.getUTCFullYear(),
  };
}

function pad2(n: number | string): string {
  return String(n).padStart(2, "0");
}

function normalizeHhmm(value: string | undefined): string | null {
  const m = String(value ?? "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${pad2(h)}:${pad2(min)}`;
}

export function parseFrTimeRange(value: string | null | undefined): DaySchedule {
  const m = String(value ?? "").match(
    /(\d{1,2})h(\d{2})\s*[–—-]\s*(\d{1,2})h(\d{2})/i,
  );
  if (!m) return { start: "14:00", end: "19:00" };
  return {
    start: `${pad2(m[1])}:${m[2]}`,
    end: `${pad2(m[3])}:${m[4]}`,
  };
}

export function formatFrTimeRange(schedule: DaySchedule): string {
  const fmt = (t: string) => {
    const [h, min] = t.split(":");
    return `${pad2(h ?? "14")}h${min ?? "00"}`;
  };
  return `${fmt(schedule.start)} – ${fmt(schedule.end)}`;
}

export function formatCompactTime(schedule: DaySchedule): string {
  const fmt = (t: string) => {
    const [h, min] = t.split(":");
    const hour = String(Number(h ?? 0));
    return min === "00" ? `${hour}h` : `${hour}h${min}`;
  };
  return `${fmt(schedule.start)}–${fmt(schedule.end)}`;
}

export function parseDayTimesJson(
  raw: unknown,
  fallbackRange: string,
  days: string[],
): Record<string, DaySchedule> {
  const fallback = parseFrTimeRange(fallbackRange);
  const obj =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const out: Record<string, DaySchedule> = {};
  for (const day of days) {
    const v = obj[day];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const rec = v as { start?: string; end?: string };
      out[day] = {
        start: normalizeHhmm(rec.start) ?? fallback.start,
        end: normalizeHhmm(rec.end) ?? fallback.end,
      };
    } else if (typeof v === "string") {
      out[day] = parseFrTimeRange(v);
    } else {
      out[day] = { ...fallback };
    }
  }
  return out;
}

export function fillDayTimes(
  startIso: string,
  endIso: string,
  previous: Record<string, DaySchedule>,
  fallbackRange: string,
): Record<string, DaySchedule> {
  return parseDayTimesJson(previous, fallbackRange, isoDaysInRange(startIso, endIso));
}

export function invitationTimeRangeFromSchedules(
  days: string[],
  schedules: Record<string, DaySchedule>,
  fallback: string,
): string {
  if (days.length === 0) return fallback;
  const ranges = days.map((d) =>
    formatFrTimeRange(schedules[d] ?? parseFrTimeRange(fallback)),
  );
  if (new Set(ranges).size === 1) return ranges[0] ?? fallback;
  return days
    .map((d) => {
      const label = isoDayToUtcDate(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });
      return `${label} : ${formatFrTimeRange(schedules[d] ?? parseFrTimeRange(fallback))}`;
    })
    .join(" · ");
}

export function eventInvitationTimeRange(event: {
  startDate: Date;
  endDate: Date;
  timeRange: string;
  dayTimes: unknown;
}): string {
  const days = isoDaysInRange(
    dateToIsoDay(event.startDate),
    dateToIsoDay(event.endDate),
  );
  const schedules = parseDayTimesJson(event.dayTimes, event.timeRange, days);
  return invitationTimeRangeFromSchedules(days, schedules, event.timeRange);
}

export function eventRangeToDbDates(startIso: string, endIso: string): Date[] {
  return isoDaysInRange(startIso, endIso).map(isoDayToUtcDate);
}

export function isoDaysInRange(startIso: string, endIso: string): string[] {
  const start = startIso <= endIso ? startIso : endIso;
  const end = startIso <= endIso ? endIso : startIso;
  const days: string[] = [];
  let t = isoDayToUtcDate(start).getTime();
  const endT = isoDayToUtcDate(end).getTime();
  const dayMs = 86_400_000;
  while (t <= endT) {
    days.push(dateToIsoDay(new Date(t)));
    t += dayMs;
  }
  return days.length > 0 ? days : [start];
}

export function parseEventDateRange(
  startValue: unknown,
  endValue: unknown,
): { startDate: string; endDate: string } | { error: string } {
  const startDate = parseEventDateInput(startValue);
  if (typeof startDate !== "string") return startDate;
  const endRaw =
    endValue == null || String(endValue).trim() === "" ? startDate : endValue;
  const endDate = parseEventDateInput(endRaw);
  if (typeof endDate !== "string") {
    return { error: "Date de fin invalide (AAAA-MM-JJ)" };
  }
  if (endDate < startDate) {
    return { error: "La date de fin doit être après la date de début" };
  }
  return { startDate, endDate };
}

export function serializeEventTemplate(
  t: EventWhatsAppTemplate,
): EventTemplateRow {
  return {
    id: t.id,
    kind: t.kind,
    label: t.label,
    contentSid: t.contentSid,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export function serializeEvent(
  event: Event & {
    templates: EventWhatsAppTemplate[];
    _count?: { guests: number };
  },
): EventRow {
  const startDate = dateToIsoDay(event.startDate);
  const endDate = dateToIsoDay(event.endDate);
  const dayTimes = parseDayTimesJson(
    event.dayTimes,
    event.timeRange,
    isoDaysInRange(startDate, endDate),
  );
  return {
    id: event.id,
    name: event.name,
    startDate,
    endDate,
    venue: event.venue,
    timeRange: event.timeRange,
    dayTimes,
    guestCount: event._count?.guests ?? 0,
    templates: event.templates.map(serializeEventTemplate),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

const CONTENT_SID_RE = /^HX[A-Za-z0-9]{20,}$/;

export function parseContentSid(value: unknown): string | { error: string } {
  const sid = String(value ?? "").trim();
  if (!sid) return { error: "Content SID requis" };
  if (!CONTENT_SID_RE.test(sid)) {
    return {
      error: "SID invalide — un Content SID Twilio commence par HX",
    };
  }
  return sid;
}

export function parseEventDateInput(value: unknown): string | { error: string } {
  const raw = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return { error: "Date invalide (AAAA-MM-JJ)" };
  }
  const d = isoDayToUtcDate(raw);
  if (Number.isNaN(d.getTime()) || dateToIsoDay(d) !== raw) {
    return { error: "Date invalide" };
  }
  return raw;
}

export function isWhatsAppTemplateKind(
  value: unknown,
): value is WhatsAppTemplateKind {
  return (
    typeof value === "string" &&
    (WHATSAPP_TEMPLATE_KINDS as readonly string[]).includes(value)
  );
}
