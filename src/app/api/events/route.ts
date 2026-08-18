import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import {
  parseEventDateRange,
  serializeEvent,
  isoDayToUtcDate,
  fillDayTimes,
} from "@/lib/events";
import { prisma } from "@/lib/prisma";

const eventInclude = {
  templates: { orderBy: { createdAt: "asc" as const } },
  _count: { select: { guests: true } },
};

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    include: eventInclude,
    orderBy: { startDate: "asc" },
  });
  return NextResponse.json(events.map(serializeEvent));
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { name?: string; startDate?: string; endDate?: string; date?: string; timeRange?: string; venue?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Nom de l'événement requis" }, { status: 400 });
  }

  const range = parseEventDateRange(body.startDate ?? body.date, body.endDate);
  if ("error" in range) {
    return NextResponse.json({ error: range.error }, { status: 400 });
  }

  const timeRange = body.timeRange?.trim() || "14h00 – 19h00";
  const venue = body.venue?.trim() ?? "";
  const dayTimes = fillDayTimes(range.startDate, range.endDate, {}, timeRange);

  const event = await prisma.event.create({
    data: {
      name,
      startDate: isoDayToUtcDate(range.startDate),
      endDate: isoDayToUtcDate(range.endDate),
      venue,
      timeRange,
      dayTimes,
    },
    include: eventInclude,
  });

  return NextResponse.json(serializeEvent(event), { status: 201 });
}
