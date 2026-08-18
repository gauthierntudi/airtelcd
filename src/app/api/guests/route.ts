import { RsvpStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import { prisma } from "@/lib/prisma";
import { parseGuestPhoneField } from "@/lib/parse-guest-phone-field";
import { createUniqueGuestToken } from "@/lib/guest-token";
import { dateToIsoDay, eventInvitationTimeRange, eventRangeToDbDates } from "@/lib/events";
import { parseEventDaysInput, eventDaysToDbDates } from "@/lib/parse-event-day";
import { parseInvitationTimeRangeInput } from "@/lib/invitation-time-range";
import { serializeGuest, guestEventInclude } from "@/lib/serialize-guest";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim();
  const statusParam = searchParams.get("status");

  const statusFilter =
    statusParam && Object.values(RsvpStatus).includes(statusParam as RsvpStatus)
      ? (statusParam as RsvpStatus)
      : undefined;

  const eventId = searchParams.get("eventId")?.trim() || undefined;

  const guests = await prisma.guest.findMany({
    where: {
      ...(statusFilter && { rsvpStatus: statusFilter }),
      ...(eventId && { eventId }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: guestEventInclude,
    orderBy: { createdAt: "desc" },
  });

  const baseUrl = request.nextUrl.origin;
  return NextResponse.json(guests.map((g) => serializeGuest(g, baseUrl)));
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: {
    fullName?: string;
    email?: string;
    phone?: string;
    eventId?: string;
    eventDay?: string | string[];
    eventDays?: string | string[];
    invitationTimeRange?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const fullName = body.fullName?.trim() || null;

  const phoneResult = parseGuestPhoneField(body.phone);
  if ("error" in phoneResult) {
    return NextResponse.json({ error: phoneResult.error }, { status: 400 });
  }

  const dayResult = parseEventDaysInput(body.eventDays ?? body.eventDay);
  if ("error" in dayResult) {
    return NextResponse.json({ error: dayResult.error }, { status: 400 });
  }

  const timeResult = parseInvitationTimeRangeInput(
    body.invitationTimeRange,
    dayResult.eventDays,
  );
  if ("error" in timeResult) {
    return NextResponse.json({ error: timeResult.error }, { status: 400 });
  }

  const eventId = body.eventId?.trim() || null;
  let eventDays = dayResult.eventDays;
  let eventDaysDb: Date[] | undefined;
  let invitationTimeRange = timeResult.invitationTimeRange;

  if (eventId) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 400 });
    }
    eventDaysDb = eventRangeToDbDates(
      dateToIsoDay(event.startDate),
      dateToIsoDay(event.endDate),
    );
    eventDays = [];
    if (!body.invitationTimeRange?.trim()) {
      invitationTimeRange = eventInvitationTimeRange(event);
    }
  }

  const token = await createUniqueGuestToken(prisma);
  const guest = await prisma.guest.create({
    data: {
      fullName,
      email: body.email?.trim() || null,
      phone: phoneResult.phone,
      eventId,
      eventDays: eventId ? eventDaysDb : eventDaysToDbDates(eventDays),
      invitationTimeRange,
      token,
    },
    include: guestEventInclude,
  });

  const baseUrl = request.nextUrl.origin;
  return NextResponse.json(serializeGuest(guest, baseUrl), { status: 201 });
}
