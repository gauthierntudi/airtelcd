import { headers } from "next/headers";

export function isAdminAuthorized(secret: string | null): boolean {
  const expected = process.env.ADMIN_SECRET;
  if (!expected || expected === "change-me-in-production") {
    return process.env.NODE_ENV === "development";
  }
  return secret === expected;
}

export async function getAdminSecretFromHeaders(): Promise<string | null> {
  const h = await headers();
  return h.get("x-admin-secret");
}
