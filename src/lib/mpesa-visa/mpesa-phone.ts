import { preprocessPhoneInput, normalizePhone, type PhoneNormalizeResult } from "@/lib/phone";

/** Préfixes mobiles Vodacom M-Pesa RDC (format local 0XX…) */
export const MPESA_VODACOM_PREFIXES = ["080", "081", "082", "083"] as const;

const MPESA_PREFIX_ERROR =
  "Seuls les numéros Vodacom M-Pesa (080, 081, 082, 083) sont autorisés.";

/** Extrait le numéro local RDC sur 10 chiffres (0 + 9 chiffres). */
export function toRdcLocalTenDigits(raw: string): string | null {
  const compact = preprocessPhoneInput(raw).replace(/\D/g, "");

  if (/^243\d{9}$/.test(compact)) {
    return `0${compact.slice(3)}`;
  }
  if (/^0\d{9}$/.test(compact)) {
    return compact.slice(0, 10);
  }
  if (/^\d{9}$/.test(compact)) {
    return `0${compact}`;
  }
  return null;
}

export function isMpesaVodacomPhone(raw: string): boolean {
  const local = toRdcLocalTenDigits(raw);
  if (!local) return false;
  const prefix = local.slice(0, 3);
  return (MPESA_VODACOM_PREFIXES as readonly string[]).includes(prefix);
}

/** Normalise et vérifie qu'il s'agit d'un numéro Vodacom M-Pesa. */
export function normalizeMpesaVodacomPhone(
  raw: string,
): PhoneNormalizeResult {
  const phone = normalizePhone(raw);
  if (!phone.ok) {
    return phone;
  }
  if (!phone.e164) {
    return { ok: false, error: "Numéro de téléphone requis." };
  }
  if (!isMpesaVodacomPhone(raw)) {
    return { ok: false, error: MPESA_PREFIX_ERROR };
  }
  return phone;
}
