import { NextRequest, NextResponse } from "next/server";
import { RsvpStatus } from "@prisma/client";
import { guestDisplayName, hasGuestFullName } from "@/lib/event";
import { prisma } from "@/lib/prisma";

const ALLOWED: RsvpStatus[] = [
  RsvpStatus.CONFIRMED,
  RsvpStatus.DECLINED,
  RsvpStatus.PENDING,
];

export async function PATCH(request: NextRequest) {
  let body: {
    token?: string;
    status?: RsvpStatus;
    fullName?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const token = body.token?.trim();
  const status = body.status;

  if (!token || !status || !ALLOWED.includes(status)) {
    return NextResponse.json(
      { error: "Token et statut RSVP requis" },
      { status: 400 },
    );
  }

  const guest = await prisma.guest.findUnique({ where: { token } });
  if (!guest) {
    return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
  }

  const fullNameInput = body.fullName?.trim();
  const needsFullName =
    status === RsvpStatus.CONFIRMED && !hasGuestFullName(guest.fullName);

  const finalFullName = fullNameInput || guest.fullName?.trim() || null;

  if (needsFullName && !finalFullName) {
    return NextResponse.json(
      { error: "Nom complet requis pour confirmer votre présence" },
      { status: 400 },
    );
  }

  const updated = await prisma.guest.update({
    where: { token },
    data: {
      ...(needsFullName && fullNameInput && { fullName: fullNameInput }),
      rsvpStatus: status,
      confirmedAt: status === RsvpStatus.CONFIRMED ? new Date() : null,
    },
  });

  return NextResponse.json({
    rsvpStatus: updated.rsvpStatus,
    confirmedAt: updated.confirmedAt?.toISOString() ?? null,
    fullName: updated.fullName,
    displayName: guestDisplayName(updated.fullName),
  });
}
