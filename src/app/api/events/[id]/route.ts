import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import {
  dateToIsoDay,
  eventRangeToDbDates,
  fillDayTimes,
  formatFrTimeRange,
  invitationTimeRangeFromSchedules,
  isoDayToUtcDate,
  isoDaysInRange,
  parseDayTimesJson,
  parseEventDateRange,
  serializeEvent,
  type DaySchedule,
} from "@/lib/events";
import { prisma } from "@/lib/prisma";

const eventInclude = {
  templates: { orderBy: { createdAt: "asc" as const } },
  _count: { select: { guests: true } },
};

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await context.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: eventInclude,
  });
  if (!event) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }
  return NextResponse.json(serializeEvent(event));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await context.params;
  let body: {
    name?: string;
    startDate?: string;
    endDate?: string;
    date?: string;
    venue?: string;
    timeRange?: string;
    dayTimes?: Record<string, DaySchedule>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  let startDate: Date | undefined;
  let endDate: Date | undefined;
  if (
    body.startDate !== undefined ||
    body.endDate !== undefined ||
    body.date !== undefined
  ) {
    const range = parseEventDateRange(
      body.startDate ?? body.date ?? dateToIsoDay(existing.startDate),
      body.endDate ?? dateToIsoDay(existing.endDate),
    );
    if ("error" in range) {
      return NextResponse.json({ error: range.error }, { status: 400 });
    }
    startDate = isoDayToUtcDate(range.startDate);
    endDate = isoDayToUtcDate(range.endDate);
  }

  const name = body.name?.trim();
  const venue = body.venue !== undefined ? body.venue.trim() : undefined;
  const nextStartIso = startDate
    ? dateToIsoDay(startDate)
    : dateToIsoDay(existing.startDate);
  const nextEndIso = endDate
    ? dateToIsoDay(endDate)
    : dateToIsoDay(existing.endDate);
  const days = isoDaysInRange(nextStartIso, nextEndIso);
  const existingSchedules = parseDayTimesJson(
    existing.dayTimes,
    existing.timeRange,
    isoDaysInRange(
      dateToIsoDay(existing.startDate),
      dateToIsoDay(existing.endDate),
    ),
  );

  const dayTimes =
    body.dayTimes !== undefined
      ? parseDayTimesJson(body.dayTimes, existing.timeRange, days)
      : startDate || endDate
        ? fillDayTimes(nextStartIso, nextEndIso, existingSchedules, existing.timeRange)
        : undefined;

  const schedules = dayTimes ?? fillDayTimes(
    nextStartIso,
    nextEndIso,
    existingSchedules,
    existing.timeRange,
  );
  const firstSchedule = days[0] ? schedules[days[0]] : undefined;
  const timeRange =
    body.timeRange?.trim() ||
    (firstSchedule ? formatFrTimeRange(firstSchedule) : existing.timeRange);
  const guestTimeRange = invitationTimeRangeFromSchedules(
    days,
    schedules,
    timeRange,
  );
  const timesChanged = Boolean(dayTimes) || Boolean(body.timeRange?.trim());

  const event = await prisma.$transaction(async (tx) => {
    const updated = await tx.event.update({
      where: { id },
      data: {
        ...(name !== undefined && name !== "" && { name }),
        ...(venue !== undefined && { venue }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(timeRange && { timeRange }),
        ...(dayTimes && { dayTimes }),
      },
      include: eventInclude,
    });

    if (startDate && endDate) {
      await tx.guest.updateMany({
        where: { eventId: id },
        data: {
          eventDays: eventRangeToDbDates(nextStartIso, nextEndIso),
          invitationTimeRange: guestTimeRange,
        },
      });
    } else if (timesChanged) {
      await tx.guest.updateMany({
        where: { eventId: id },
        data: { invitationTimeRange: guestTimeRange },
      });
    }

    return updated;
  });

  return NextResponse.json(serializeEvent(event));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    await prisma.event.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
