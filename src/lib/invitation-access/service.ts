import {
  findGuestByAccessAddress,
  normalizeAccessAddress,
} from "@/lib/invitation-access/find-guest";
import {
  generateOtpCode,
  hashOtpCode,
  MAX_VERIFY_ATTEMPTS,
  otpExpiresAt,
  RESEND_COOLDOWN_MS,
  verifyOtpCode,
} from "@/lib/invitation-access/otp-crypto";
import {
  INVITATION_ACCESS_EMAIL_NOT_FOUND,
  INVITATION_ACCESS_GENERIC_SENT,
  INVITATION_ACCESS_SMS_NOT_FOUND,
} from "@/lib/invitation-access/types";
import type { InvitationAccessChannel } from "@/lib/invitation-access/types";
import { guestFirstNameLabel } from "@/lib/event";
import { isTwilioVerifyConfigured } from "@/lib/messaging/config";
import { canDeliverOtp, deliverOtpCode } from "@/lib/messaging/send-otp";
import {
  checkTwilioVerifySms,
  TWILIO_VERIFY_OTP_MARKER,
} from "@/lib/messaging/twilio-verify";
import { invitationPath } from "@/lib/invitation-url";
import { prisma } from "@/lib/prisma";

export type RequestOtpInput = {
  channel: InvitationAccessChannel;
  contact: string;
};

export type RequestOtpResult = {
  message: string;
  /** Dev uniquement — jamais exposé en production */
  devCode?: string;
};

export async function requestInvitationAccessOtp(
  input: RequestOtpInput,
): Promise<RequestOtpResult> {
  const normalized = normalizeAccessAddress(input.channel, input.contact);
  if (!normalized.ok) {
    throw new Error(normalized.error);
  }

  const { address } = normalized;
  const guest = await findGuestByAccessAddress(input.channel, address);

  if (!guest) {
    if (input.channel === "sms") {
      throw new Error(INVITATION_ACCESS_SMS_NOT_FOUND);
    }
    throw new Error(INVITATION_ACCESS_EMAIL_NOT_FOUND);
  }

  if (input.channel === "email" && !guest.email?.trim()) {
    throw new Error(INVITATION_ACCESS_EMAIL_NOT_FOUND);
  }
  if (input.channel === "sms" && !guest.phone?.trim()) {
    throw new Error(INVITATION_ACCESS_SMS_NOT_FOUND);
  }

  const latest = await prisma.invitationAccessOtp.findFirst({
    where: { address, channel: input.channel },
    orderBy: { createdAt: "desc" },
  });
  if (
    latest &&
    Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS
  ) {
    return { message: INVITATION_ACCESS_GENERIC_SENT };
  }

  const useTwilioVerify =
    input.channel === "sms" && isTwilioVerifyConfigured();
  const code = useTwilioVerify ? null : generateOtpCode();
  const codeHash = useTwilioVerify
    ? TWILIO_VERIFY_OTP_MARKER
    : hashOtpCode(code!, address, guest.id);

  await prisma.invitationAccessOtp.deleteMany({
    where: { guestId: guest.id },
  });

  await prisma.invitationAccessOtp.create({
    data: {
      guestId: guest.id,
      channel: input.channel,
      address,
      codeHash,
      expiresAt: otpExpiresAt(),
    },
  });

  const isDev = process.env.NODE_ENV === "development";

  if (!canDeliverOtp(input.channel)) {
    if (isDev && code) {
      console.info(
        `[invitation-otp] ${input.channel} → ${address} : ${code}`,
      );
      return {
        message: INVITATION_ACCESS_GENERIC_SENT,
        devCode: code,
      };
    }
    throw new Error(
      "Envoi du code temporairement indisponible. Réessayez plus tard.",
    );
  }

  try {
    await deliverOtpCode({
      channel: input.channel,
      address,
      firstName: guestFirstNameLabel(guest.fullName),
      code: code ?? "",
    });
  } catch (e) {
    if (isDev && code) {
      console.info(
        `[invitation-otp] échec envoi, code dev : ${code}`,
        e,
      );
      return {
        message: INVITATION_ACCESS_GENERIC_SENT,
        devCode: code,
      };
    }
    throw e;
  }

  return { message: INVITATION_ACCESS_GENERIC_SENT };
}

export type VerifyOtpInput = {
  channel: InvitationAccessChannel;
  contact: string;
  code: string;
};

export type VerifyOtpResult = {
  redirectPath: string;
  guestId: string;
};

export async function verifyInvitationAccessOtp(
  input: VerifyOtpInput,
): Promise<VerifyOtpResult> {
  const normalized = normalizeAccessAddress(input.channel, input.contact);
  if (!normalized.ok) {
    throw new Error(normalized.error);
  }

  const { address } = normalized;
  const record = await prisma.invitationAccessOtp.findFirst({
    where: { address, channel: input.channel },
    orderBy: { createdAt: "desc" },
    include: { guest: true },
  });

  if (!record) {
    throw new Error("Code invalide ou expiré.");
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.invitationAccessOtp.delete({ where: { id: record.id } });
    throw new Error("Code expiré. Demandez un nouveau code.");
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new Error("Trop de tentatives. Demandez un nouveau code.");
  }

  let valid = false;
  if (record.codeHash === TWILIO_VERIFY_OTP_MARKER) {
    valid = await checkTwilioVerifySms(address, input.code);
  } else {
    valid = verifyOtpCode(
      input.code,
      address,
      record.guestId,
      record.codeHash,
    );
  }

  if (!valid) {
    await prisma.invitationAccessOtp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw new Error("Code incorrect.");
  }

  await prisma.invitationAccessOtp.deleteMany({
    where: { guestId: record.guestId },
  });

  return {
    redirectPath: invitationPath(record.guest.token),
    guestId: record.guestId,
  };
}
