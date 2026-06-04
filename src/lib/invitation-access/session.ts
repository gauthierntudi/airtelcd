import { createHmac, timingSafeEqual } from "crypto";
import { getInvitationAccessSecret } from "@/lib/invitation-access/secret";

export const INVITATION_SESSION_COOKIE = "invitation_access";

const DEFAULT_SESSION_DAYS = 30;

function sessionMaxAgeSeconds(): number {
  const days = Number(process.env.INVITATION_SESSION_DAYS?.trim());
  const valid = Number.isFinite(days) && days > 0 ? days : DEFAULT_SESSION_DAYS;
  return Math.floor(valid * 24 * 60 * 60);
}

function sign(payload: string): string {
  return createHmac("sha256", getInvitationAccessSecret())
    .update(payload)
    .digest("base64url");
}

/** Valeur cookie : guestId.expiresAtMs.signature */
export function createInvitationSessionValue(guestId: string): string {
  const expiresAt = Date.now() + sessionMaxAgeSeconds() * 1000;
  const payload = `${guestId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function parseInvitationSessionValue(
  value: string | undefined | null,
): { guestId: string } | null {
  if (!value?.trim()) return null;

  const parts = value.trim().split(".");
  if (parts.length !== 3) return null;

  const [guestId, expRaw, signature] = parts;
  if (!guestId || !expRaw || !signature) return null;

  const expiresAt = Number(expRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

  const payload = `${guestId}.${expRaw}`;
  const expected = sign(payload);

  try {
    const a = Buffer.from(signature, "base64url");
    const b = Buffer.from(expected, "base64url");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  return { guestId };
}

export function invitationSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAgeSeconds(),
  };
}
