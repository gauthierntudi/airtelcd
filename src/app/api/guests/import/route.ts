import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import type { GuestImportRow } from "@/lib/parse-guest-csv";
import { prisma } from "@/lib/prisma";
import { parseGuestPhoneField } from "@/lib/parse-guest-phone-field";
import { createUniqueGuestToken } from "@/lib/guest-token";
import { dateToIsoDay, eventInvitationTimeRange, eventRangeToDbDates } from "@/lib/events";
import { parseEventDaysInput, eventDaysToDbDates } from "@/lib/parse-event-day";
import { parseInvitationTimeRangeInput } from "@/lib/invitation-time-range";
import { normalizePhone } from "@/lib/phone";
import { serializeGuest, guestEventInclude } from "@/lib/serialize-guest";

async function loadExistingPhoneE164Set(): Promise<Set<string>> {
  const rows = await prisma.guest.findMany({
    where: { phone: { not: null } },
    select: { phone: true },
  });
  const set = new Set<string>();
  for (const { phone } of rows) {
    if (!phone) continue;
    const norm = normalizePhone(phone);
    if (norm.ok && norm.e164) set.add(norm.e164);
  }
  return set;
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: {
    guests?: GuestImportRow[];
    eventDays?: string | string[];
    eventId?: string;
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
  const timeResult = parseInvitationTimeRangeInput(
    body.invitationTimeRange,
    dayResult.eventDays,
  );
  if ("error" in timeResult) {
    return NextResponse.json({ error: timeResult.error }, { status: 400 });
  }

  const eventId = body.eventId?.trim() || null;
  let eventDaysDb = eventDaysToDbDates(dayResult.eventDays);
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
    if (!body.invitationTimeRange?.trim()) {
      invitationTimeRange = eventInvitationTimeRange(event);
    }
  }

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
  const skippedRows: { index: number; message: string }[] = [];
  const created: ReturnType<typeof serializeGuest>[] = [];
  const knownPhones = await loadExistingPhoneE164Set();
  const batchPhones = new Set<string>();

  for (let i = 0; i < guests.length; i++) {
    const row = guests[i];
    const fullName = row.fullName?.trim() || null;

    const phoneResult = parseGuestPhoneField(row.phone);
    if ("error" in phoneResult) {
      rowErrors.push({ index: i + 1, message: phoneResult.error });
      continue;
    }

    const phoneE164 = phoneResult.phone;
    if (phoneE164) {
      if (knownPhones.has(phoneE164)) {
        skippedRows.push({
          index: i + 1,
          message: "Numéro déjà enregistré — ignoré",
        });
        continue;
      }
      if (batchPhones.has(phoneE164)) {
        skippedRows.push({
          index: i + 1,
          message: "Numéro en double dans le fichier — ignoré",
        });
        continue;
      }
    }

    try {
      const token = await createUniqueGuestToken(prisma);
      const guest = await prisma.guest.create({
        data: {
          fullName,
          email: row.email?.trim() || null,
          phone: phoneE164,
          eventId,
          eventDays: eventDaysDb,
          invitationTimeRange,
          token,
        },
        include: guestEventInclude,
      });
      if (phoneE164) {
        knownPhones.add(phoneE164);
        batchPhones.add(phoneE164);
      }
      created.push(serializeGuest(guest, baseUrl));
    } catch {
      rowErrors.push({ index: i + 1, message: "Impossible de créer cet invité" });
    }
  }

  return NextResponse.json({
    created: created.length,
    skipped: skippedRows.length,
    failed: rowErrors.length,
    guests: created,
    errors: rowErrors,
    skippedRows,
  });
}
