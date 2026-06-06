import { RsvpStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import { prisma } from "@/lib/prisma";
import { parseGuestPhoneField } from "@/lib/parse-guest-phone-field";
import { parseEventDaysInput, eventDaysToDbDates } from "@/lib/parse-event-day";
import { parseInvitationTimeRangeInput } from "@/lib/invitation-time-range";
import { serializeGuest } from "@/lib/serialize-guest";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await context.params;
  let body: {
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phone?: string | null;
    rsvpStatus?: RsvpStatus;
    eventDay?: string | string[];
    eventDays?: string | string[];
    invitationTimeRange?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const existing = await prisma.guest.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Invité introuvable" }, { status: 404 });
  }

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();

  const rsvpStatus = body.rsvpStatus;
  if (rsvpStatus && !Object.values(RsvpStatus).includes(rsvpStatus)) {
    return NextResponse.json({ error: "Statut RSVP invalide" }, { status: 400 });
  }

  let phoneData: { phone: string | null } | undefined;
  if (body.phone !== undefined) {
    const phoneResult = parseGuestPhoneField(body.phone);
    if ("error" in phoneResult) {
      return NextResponse.json({ error: phoneResult.error }, { status: 400 });
    }
    phoneData = { phone: phoneResult.phone };
  }

  let eventDaysData: { eventDays: Date[] } | undefined;
  if (body.eventDays !== undefined || body.eventDay !== undefined) {
    const dayResult = parseEventDaysInput(body.eventDays ?? body.eventDay);
    if ("error" in dayResult) {
      return NextResponse.json({ error: dayResult.error }, { status: 400 });
    }
    eventDaysData = { eventDays: eventDaysToDbDates(dayResult.eventDays) };
  }

  let invitationTimeRangeData: { invitationTimeRange: string } | undefined;
  if (body.invitationTimeRange !== undefined) {
    const timeResult = parseInvitationTimeRangeInput(body.invitationTimeRange);
    if ("error" in timeResult) {
      return NextResponse.json({ error: timeResult.error }, { status: 400 });
    }
    invitationTimeRangeData = {
      invitationTimeRange: timeResult.invitationTimeRange,
    };
  }

  const updated = await prisma.guest.update({
    where: { id },
    data: {
      ...(body.firstName !== undefined && { firstName: firstName || null }),
      ...(body.lastName !== undefined && {
        lastName: lastName || null,
      }),
      ...(body.email !== undefined && {
        email: body.email?.trim() || null,
      }),
      ...phoneData,
      ...eventDaysData,
      ...invitationTimeRangeData,
      ...(rsvpStatus !== undefined && {
        rsvpStatus,
        confirmedAt:
          rsvpStatus === RsvpStatus.CONFIRMED
            ? new Date()
            : null,
      }),
    },
  });

  const baseUrl = request.nextUrl.origin;
  return NextResponse.json(serializeGuest(updated, baseUrl));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    await prisma.guest.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Invité introuvable" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
