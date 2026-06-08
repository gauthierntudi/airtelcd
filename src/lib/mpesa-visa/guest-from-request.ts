import { cookies } from "next/headers";
import {
  INVITATION_SESSION_COOKIE,
  parseInvitationSessionValue,
} from "@/lib/invitation-access/session";
import { prisma } from "@/lib/prisma";

export async function getMpesaGuestIdFromCookies(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(INVITATION_SESSION_COOKIE)?.value;
  const parsed = parseInvitationSessionValue(raw);
  return parsed?.guestId ?? null;
}

export async function getMpesaGuestFromCookies() {
  const guestId = await getMpesaGuestIdFromCookies();
  if (!guestId) return null;

  return prisma.guest.findUnique({
    where: { id: guestId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
    },
  });
}
