import type { Guest } from "@prisma/client";
import { normalizePhone, phoneMatchesE164 } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import type { InvitationAccessChannel } from "@/lib/invitation-access/types";

export function normalizeAccessEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function normalizeAccessAddress(
  channel: InvitationAccessChannel,
  raw: string,
): { ok: true; address: string } | { ok: false; error: string } {
  if (channel === "email") {
    const address = normalizeAccessEmail(raw);
    if (!address.includes("@") || address.length < 5) {
      return { ok: false, error: "Adresse e-mail invalide." };
    }
    return { ok: true, address };
  }

  const phone = normalizePhone(raw);
  if (!phone.ok) return { ok: false, error: phone.error };
  if (!phone.e164) {
    return { ok: false, error: "Numéro de téléphone requis." };
  }
  return { ok: true, address: phone.e164 };
}

export async function findGuestByAccessAddress(
  channel: InvitationAccessChannel,
  address: string,
): Promise<Guest | null> {
  if (channel === "email") {
    return prisma.guest.findFirst({
      where: { email: { equals: address, mode: "insensitive" } },
    });
  }
  const exact = await prisma.guest.findFirst({
    where: { phone: address },
  });
  if (exact) return exact;

  const withPhone = await prisma.guest.findMany({
    where: { phone: { not: null } },
  });
  return withPhone.find((g) => phoneMatchesE164(g.phone, address)) ?? null;
}
