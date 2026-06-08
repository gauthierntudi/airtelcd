/** Année complète — accepte 26 ou 2026 (anciennes cartes en BD). */
export function normalizeExpiryYear(year: number): number {
  if (year < 100) return 2000 + year;
  return year;
}

export function formatExpiryYearTwoDigits(year: number): string {
  return String(normalizeExpiryYear(year) % 100).padStart(2, "0");
}

export function formatExpiryDisplay(month: number, year: number): string {
  return `${String(month).padStart(2, "0")}/${formatExpiryYearTwoDigits(year)}`;
}

/** Saisie progressive MM/AA — ex. « 0 » → « 09 » → « 09/2 » → « 09/26 ». */
export function formatExpiryInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function parseExpiryInput(raw: string): {
  expiryMonth: number;
  expiryYear: number;
} | null {
  const cleaned = raw.replace(/\D/g, "");
  if (cleaned.length === 4) {
    const expiryMonth = Number(cleaned.slice(0, 2));
    const yy = Number(cleaned.slice(2, 4));
    if (expiryMonth < 1 || expiryMonth > 12) return null;
    return { expiryMonth, expiryYear: normalizeExpiryYear(yy) };
  }
  const match = raw.trim().match(/^(\d{1,2})\s*\/\s*(\d{2,4})$/);
  if (!match) return null;
  const expiryMonth = Number(match[1]);
  const expiryYear = Number(match[2]);
  if (expiryMonth < 1 || expiryMonth > 12) return null;
  return { expiryMonth, expiryYear: normalizeExpiryYear(expiryYear) };
}
