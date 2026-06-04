import { createHash, randomInt } from "crypto";
import { getInvitationAccessSecret } from "@/lib/invitation-access/secret";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_LENGTH = 6;
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

export function otpExpiresAt(from = Date.now()): Date {
  return new Date(from + OTP_TTL_MS);
}

export function generateOtpCode(): string {
  return String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
}

export function hashOtpCode(code: string, address: string, guestId: string): string {
  return createHash("sha256")
    .update(`${getInvitationAccessSecret()}:${guestId}:${address}:${code}`)
    .digest("hex");
}

export function verifyOtpCode(
  code: string,
  address: string,
  guestId: string,
  codeHash: string,
): boolean {
  const normalized = code.replace(/\D/g, "").padStart(OTP_LENGTH, "0").slice(-OTP_LENGTH);
  if (normalized.length !== OTP_LENGTH) return false;
  return hashOtpCode(normalized, address, guestId) === codeHash;
}

export { MAX_VERIFY_ATTEMPTS, OTP_LENGTH, RESEND_COOLDOWN_MS };
