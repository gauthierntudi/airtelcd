import { RsvpStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import { prisma } from "@/lib/prisma";
import { parseGuestPhoneField } from "@/lib/parse-guest-phone-field";
import { createUniqueGuestToken } from "@/lib/guest-token";
import { parseEventDaysInput, eventDaysToDbDates } from "@/lib/parse-event-day";
import { serializeGuest } from "@/lib/serialize-guest";

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

  const guests = await prisma.guest.findMany({
    where: {
      ...(statusFilter && { rsvpStatus: statusFilter }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
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
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    eventDay?: string | string[];
    eventDays?: string | string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: "Prénom et nom requis" },
      { status: 400 },
    );
  }

  const phoneResult = parseGuestPhoneField(body.phone);
  if ("error" in phoneResult) {
    return NextResponse.json({ error: phoneResult.error }, { status: 400 });
  }

  const dayResult = parseEventDaysInput(body.eventDays ?? body.eventDay);
  if ("error" in dayResult) {
    return NextResponse.json({ error: dayResult.error }, { status: 400 });
  }

  const token = await createUniqueGuestToken(prisma);
  const guest = await prisma.guest.create({
    data: {
      firstName,
      lastName,
      email: body.email?.trim() || null,
      phone: phoneResult.phone,
      eventDays: eventDaysToDbDates(dayResult.eventDays),
      token,
    },
  });

  const baseUrl = request.nextUrl.origin;
  return NextResponse.json(serializeGuest(guest, baseUrl), { status: 201 });
}
