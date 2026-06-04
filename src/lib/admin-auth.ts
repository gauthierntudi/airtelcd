import { cookies } from "next/headers";

const COOKIE_NAME = "admin_secret";

/** Secret admin effectif, ou null si connexion requise. */
export async function getEffectiveAdminSecret(): Promise<string | null> {
  const cookieStore = await cookies();
  const secret = cookieStore.get(COOKIE_NAME)?.value;
  const expected = process.env.ADMIN_SECRET;
  const isDevFallback =
    (!expected || expected === "change-me-in-production") &&
    process.env.NODE_ENV === "development";

  if (!secret && !isDevFallback) return null;
  return secret ?? expected ?? "dev";
}
