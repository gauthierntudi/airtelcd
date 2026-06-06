import { NextRequest, NextResponse } from "next/server";
import { RsvpStatus } from "@prisma/client";
import {
  guestDisplayName,
  hasGuestFirstName,
  hasGuestFullName,
  hasGuestLastName,
} from "@/lib/event";
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
    firstName?: string;
    lastName?: string;
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

  const firstNameInput = body.firstName?.trim();
  const lastNameInput = body.lastName?.trim();
  const needsFullName =
    status === RsvpStatus.CONFIRMED &&
    !hasGuestFullName(guest.firstName, guest.lastName);

  const finalFirst = firstNameInput || guest.firstName?.trim() || null;
  const finalLast = lastNameInput || guest.lastName?.trim() || null;

  if (needsFullName && (!finalFirst || !finalLast)) {
    return NextResponse.json(
      { error: "Prénom et nom requis pour confirmer votre présence" },
      { status: 400 },
    );
  }

  const updated = await prisma.guest.update({
    where: { token },
    data: {
      ...(needsFullName &&
        firstNameInput &&
        !hasGuestFirstName(guest.firstName) && { firstName: firstNameInput }),
      ...(needsFullName &&
        lastNameInput &&
        !hasGuestLastName(guest.lastName) && { lastName: lastNameInput }),
      rsvpStatus: status,
      confirmedAt: status === RsvpStatus.CONFIRMED ? new Date() : null,
    },
  });

  return NextResponse.json({
    rsvpStatus: updated.rsvpStatus,
    confirmedAt: updated.confirmedAt?.toISOString() ?? null,
    firstName: updated.firstName,
    lastName: updated.lastName,
    displayName: guestDisplayName(updated.firstName, updated.lastName),
  });
}
