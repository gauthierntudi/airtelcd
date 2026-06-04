import type { PrismaClient } from "@prisma/client";
import { randomInt } from "node:crypto";

const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";

/** Format invité : 4 lettres (casse mixte) + 4 chiffres, ex. `aBcD1234` */
export const GUEST_TOKEN_PATTERN = /^[a-zA-Z]{4}[0-9]{4}$/;

export function isGuestTokenFormat(token: string): boolean {
  return GUEST_TOKEN_PATTERN.test(token);
}

export function generateGuestToken(): string {
  let token = "";
  for (let i = 0; i < 4; i++) {
    token += LETTERS[randomInt(LETTERS.length)];
  }
  for (let i = 0; i < 4; i++) {
    token += DIGITS[randomInt(DIGITS.length)];
  }
  return token;
}

export async function createUniqueGuestToken(
  db: Pick<PrismaClient, "guest">,
): Promise<string> {
  const maxAttempts = 25;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const token = generateGuestToken();
    const existing = await db.guest.findUnique({
      where: { token },
      select: { id: true },
    });
    if (!existing) return token;
  }
  throw new Error("Impossible de générer un token invité unique");
}
