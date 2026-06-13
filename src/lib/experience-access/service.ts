import {
  findGuestByAccessAddress,
  normalizeAccessAddress,
} from "@/lib/invitation-access/find-guest";
import type { InvitationAccessChannel } from "@/lib/invitation-access/types";
import { EXPERIENCE_ACCESS_EMAIL_HINT } from "@/lib/experience-access/types";
import { createUniqueGuestToken } from "@/lib/guest-token";
import { normalizeMpesaVodacomPhone } from "@/lib/mpesa-visa/mpesa-phone";
import { prisma } from "@/lib/prisma";

export type ExperienceAccessInput = {
  channel: InvitationAccessChannel;
  contact: string;
};

export type ExperienceAccessResult = {
  guestId: string;
  walkIn: boolean;
};

/** Accès kiosque Privilège / M-Pesa / Mall — invité BD ou création walk-in (mobile Vodacom). */
export async function authenticateExperienceAccess(
  input: ExperienceAccessInput,
): Promise<ExperienceAccessResult> {
  const normalized = normalizeAccessAddress(input.channel, input.contact);
  if (!normalized.ok) {
    throw new Error(normalized.error);
  }

  const existing = await findGuestByAccessAddress(
    input.channel,
    normalized.address,
  );

  if (existing) {
    return {
      guestId: existing.id,
      walkIn: existing.experienceOnly,
    };
  }

  if (input.channel !== "sms") {
    throw new Error(EXPERIENCE_ACCESS_EMAIL_HINT);
  }

  const phone = normalizeMpesaVodacomPhone(input.contact);
  if (!phone.ok) {
    throw new Error(phone.error);
  }

  const token = await createUniqueGuestToken(prisma);
  const guest = await prisma.guest.create({
    data: {
      phone: phone.e164,
      token,
      experienceOnly: true,
      eventDays: [],
    },
  });

  return { guestId: guest.id, walkIn: true };
}
