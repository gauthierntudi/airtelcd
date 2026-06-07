import { EVENT } from "@/lib/event";
import type { EventDayId } from "@/lib/event-days";

function icsDateTime(dayId: EventDayId, hour: number, minute: number): string {
  const compact = dayId.replace(/-/g, "");
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${compact}T${h}${m}00`;
}

function dayIcsRange(dayId: EventDayId) {
  return {
    start: icsDateTime(dayId, 8, 0),
    end: icsDateTime(dayId, 17, 0),
  };
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildGoogleCalendarUrl(
  invitationUrl: string,
  eventDays: EventDayId[],
): string {
  const primary = eventDays[0] ?? "2026-06-12";
  const { start, end } = dayIcsRange(primary);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: EVENT.title,
    dates: `${start}/${end}`,
    details: `Invitation Vodacom Privilège Golf.\nConfirmer : ${invitationUrl}`,
    location: EVENT.venue,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsDownloadUrl(
  invitationUrl: string,
  eventDays: EventDayId[],
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vodacom Privilège//Golf 2026//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  eventDays.forEach((dayId, index) => {
    const { start, end } = dayIcsRange(dayId);
    lines.push(
      "BEGIN:VEVENT",
      `UID:golf2026-${index}-${icsEscape(invitationUrl)}@vodacomprivilege.com`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${icsEscape(EVENT.title)}`,
      `LOCATION:${icsEscape(EVENT.venue)}`,
      `DESCRIPTION:${icsEscape(`Confirmer votre présence : ${invitationUrl}`)}`,
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}
