import {
  type CountryCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

/** Pays par défaut : RDC (invités Vodacom Privilege Golf) */
export const DEFAULT_PHONE_COUNTRY: CountryCode = "CD";

export type PhoneNormalizeResult =
  | { ok: true; e164: string; international: string }
  | { ok: false; error: string };

/**
 * Prépare la saisie invité avant parsing libphonenumber (RDC).
 * Accepte 082…, 824…, 243…, +243…, espaces et tirets.
 */
export function preprocessPhoneInput(raw: string): string {
  const trimmed = raw.trim();
  const compact = trimmed.replace(/[\s.\-()/]/g, "");

  if (/^00?243\d{9}$/.test(compact)) {
    const digits = compact.replace(/^00/, "");
    return `+${digits}`;
  }
  if (/^243\d{9}$/.test(compact)) {
    return `+${compact}`;
  }
  if (/^0\d{9}$/.test(compact)) {
    return compact;
  }
  if (/^\d{9}$/.test(compact)) {
    return compact;
  }
  if (compact.startsWith("+")) {
    return compact;
  }

  return trimmed.replace(/[^\d+]/g, "") || compact;
}

/** RDC sans métadonnées pays « CD » (bundle min de libphonenumber-js / Turbopack). */
function tryNormalizeRdcE164(prepared: string): string | null {
  const compact = prepared.replace(/[\s.\-()/]/g, "");
  if (/^\+243\d{9}$/.test(compact)) return compact;
  if (/^243\d{9}$/.test(compact)) return `+${compact}`;
  if (/^0\d{9}$/.test(compact)) return `+243${compact.slice(1)}`;
  if (/^\d{9}$/.test(compact)) return `+243${compact}`;
  return null;
}

function formatRdcInternational(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("243")) {
    const local = digits.slice(3);
    return `+243 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return e164;
}

/**
 * Normalise vers E.164 (+243…) pour stockage, recherche BD et envoi Twilio SMS/WhatsApp.
 * Ex. « 0824269291 » → « +243824269291 »
 */
export function normalizePhone(
  raw: string | null | undefined,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): PhoneNormalizeResult | { ok: true; e164: null; international: null } {
  if (!raw?.trim()) {
    return { ok: true, e164: null, international: null };
  }

  const prepared = preprocessPhoneInput(raw);
  const rdcE164 = tryNormalizeRdcE164(prepared);
  if (rdcE164) {
    return {
      ok: true,
      e164: rdcE164,
      international: formatRdcInternational(rdcE164),
    };
  }

  const parsed =
    parsePhoneNumberFromString(prepared) ??
    parsePhoneNumberFromString(prepared, defaultCountry);
  if (!parsed?.isValid()) {
    return {
      ok: false,
      error:
        "Numéro invalide. Utilisez par ex. 0815191631, 815191631 ou +243 815 191 631.",
    };
  }

  return {
    ok: true,
    e164: parsed.format("E.164"),
    international: parsed.formatInternational(),
  };
}

/** Compare un numéro stocké (tout format) avec un E.164 cible */
export function phoneMatchesE164(
  stored: string | null | undefined,
  e164: string,
): boolean {
  if (!stored?.trim()) return false;
  const norm = normalizePhone(stored);
  if (norm.ok && norm.e164 === e164) return true;

  const a = e164.replace(/\D/g, "");
  const b = stored.replace(/\D/g, "");
  if (a === b) return true;
  if (a.endsWith(b) || b.endsWith(a)) return true;
  if (a.slice(-9) === b.slice(-9)) return true;
  return false;
}

/** Affichage lisible à partir d’un numéro E.164 stocké */
export function formatPhoneDisplay(e164: string | null | undefined): string {
  if (!e164?.trim()) return "—";
  const parsed = parsePhoneNumberFromString(e164);
  return parsed?.isValid() ? parsed.formatInternational() : e164;
}

/** Lien WhatsApp (wa.me) à partir d’un E.164 */
export function whatsAppUrl(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export const PHONE_INPUT_HINT =
  "RDC : 0815191631, 815191631 ou +243… — enregistré automatiquement en +243… pour WhatsApp.";
