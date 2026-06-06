import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import type { GuestImportRow } from "@/lib/parse-guest-csv";
import { prisma } from "@/lib/prisma";
import { parseGuestPhoneField } from "@/lib/parse-guest-phone-field";
import { createUniqueGuestToken } from "@/lib/guest-token";
import { parseEventDaysInput, eventDaysToDbDates } from "@/lib/parse-event-day";
import { parseInvitationTimeRangeInput } from "@/lib/invitation-time-range";
import { serializeGuest } from "@/lib/serialize-guest";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: {
    guests?: GuestImportRow[];
    eventDays?: string | string[];
    invitationTimeRange?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const dayResult = parseEventDaysInput(body.eventDays);
  if ("error" in dayResult) {
    return NextResponse.json({ error: dayResult.error }, { status: 400 });
  }
  const eventDaysDb = eventDaysToDbDates(dayResult.eventDays);

  const timeResult = parseInvitationTimeRangeInput(body.invitationTimeRange);
  if ("error" in timeResult) {
    return NextResponse.json({ error: timeResult.error }, { status: 400 });
  }
  const invitationTimeRange = timeResult.invitationTimeRange;

  const guests = body.guests;
  if (!Array.isArray(guests) || guests.length === 0) {
    return NextResponse.json(
      { error: "Liste d'invités vide" },
      { status: 400 },
    );
  }

  if (guests.length > 500) {
    return NextResponse.json(
      { error: "Maximum 500 invités par import" },
      { status: 400 },
    );
  }

  const baseUrl = request.nextUrl.origin;
  const rowErrors: { index: number; message: string }[] = [];
  const created: ReturnType<typeof serializeGuest>[] = [];

  for (let i = 0; i < guests.length; i++) {
    const row = guests[i];
    const firstName = row.firstName?.trim() || null;
    const lastName = row.lastName?.trim() || null;

    const phoneResult = parseGuestPhoneField(row.phone);
    if ("error" in phoneResult) {
      rowErrors.push({ index: i + 1, message: phoneResult.error });
      continue;
    }

    try {
      const token = await createUniqueGuestToken(prisma);
      const guest = await prisma.guest.create({
        data: {
          firstName,
          lastName,
          email: row.email?.trim() || null,
          phone: phoneResult.phone,
          eventDays: eventDaysDb,
          invitationTimeRange,
          token,
        },
      });
      created.push(serializeGuest(guest, baseUrl));
    } catch {
      rowErrors.push({ index: i + 1, message: "Impossible de créer cet invité" });
    }
  }

  return NextResponse.json({
    created: created.length,
    failed: rowErrors.length,
    guests: created,
    errors: rowErrors,
  });
}
