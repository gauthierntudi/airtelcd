import { createHash } from "crypto";

function digitsFromHash(hash: string, count: number, offset: number): string {
  let out = "";
  for (let i = 0; i < count; i++) {
    const idx = (offset + i * 2) % (hash.length - 1);
    out += String(parseInt(hash.slice(idx, idx + 2), 16) % 10);
  }
  return out;
}

/** Génère des détails de carte démo stables par invité */
export function generateVisaCardDetails(guestId: string) {
  const hash = createHash("sha256").update(guestId).digest("hex");
  const bin = "4532";
  const pan16 = `${bin}${digitsFromHash(hash, 12, 4)}`;
  const lastFour = pan16.slice(-4);
  const panFormatted = `${pan16.slice(0, 4)} ${pan16.slice(4, 8)} ${pan16.slice(8, 12)} ${pan16.slice(12, 16)}`;
  const masked = `${bin} •••• •••• ${lastFour}`;
  const month = 6 + (parseInt(hash.slice(4, 6), 16) % 6);
  const year = 26;
  const cvv = digitsFromHash(hash, 3, 28);
  return {
    cardLastFour: lastFour,
    cardMasked: masked,
    pan16,
    panFormatted,
    expiryMonth: month,
    expiryYear: year,
    expiryDisplay: `${String(month).padStart(2, "0")}/${year}`,
    cvv,
    cvvDisplay: cvv,
  };
}
