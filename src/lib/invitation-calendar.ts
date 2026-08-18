import type { EventDayId } from "@/lib/event-days";
import { parseFrTimeRange, type DaySchedule } from "@/lib/events";

type CalendarInput = {
  invitationUrl: string;
  eventName: string;
  venue: string;
  eventDays: EventDayId[];
  dayTimes?: Record<string, DaySchedule>;
  fallbackRange?: string;
};

function icsDateTime(dayId: EventDayId, hour: number, minute: number): string {
  const compact = dayId.replace(/-/g, "");
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${compact}T${h}${m}00`;
}

function dayIcsRange(
  dayId: EventDayId,
  dayTimes: Record<string, DaySchedule> | undefined,
  fallbackRange: string,
) {
  const schedule = dayTimes?.[dayId] ?? parseFrTimeRange(fallbackRange);
  const [startH, startM] = schedule.start.split(":").map(Number);
  const [endH, endM] = schedule.end.split(":").map(Number);
  return {
    start: icsDateTime(dayId, startH || 14, startM || 0),
    end: icsDateTime(dayId, endH || 19, endM || 0),
  };
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildGoogleCalendarUrl({
  invitationUrl,
  eventName,
  venue,
  eventDays,
  dayTimes,
  fallbackRange = "14h00 – 19h00",
}: CalendarInput): string {
  const primary = eventDays[0] ?? "2026-06-12";
  const { start, end } = dayIcsRange(primary, dayTimes, fallbackRange);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventName,
    dates: `${start}/${end}`,
    details: `Invitation.\nConfirmer : ${invitationUrl}`,
    location: venue,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsDownloadUrl({
  invitationUrl,
  eventName,
  venue,
  eventDays,
  dayTimes,
  fallbackRange = "14h00 – 19h00",
}: CalendarInput): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Airtel RSVP//Invitation//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  eventDays.forEach((dayId, index) => {
    const { start, end } = dayIcsRange(dayId, dayTimes, fallbackRange);
    lines.push(
      "BEGIN:VEVENT",
      `UID:rsvp-${index}-${icsEscape(invitationUrl)}@airtel.cd`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${icsEscape(eventName)}`,
      `LOCATION:${icsEscape(venue)}`,
      `DESCRIPTION:${icsEscape(`Confirmer votre présence : ${invitationUrl}`)}`,
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}
