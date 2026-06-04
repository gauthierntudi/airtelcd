import { normalizePhone } from "@/lib/phone";

export function parseGuestPhoneField(
  phone: string | null | undefined,
): { phone: string | null } | { error: string } {
  if (phone === undefined || phone === null || !String(phone).trim()) {
    return { phone: null };
  }

  const result = normalizePhone(phone);
  if (!result.ok) return { error: result.error };
  if (!result.e164) {
    return { error: "Numéro de téléphone requis." };
  }
  return { phone: result.e164 };
}
