import { generateVisaCardDetails } from "@/lib/mpesa-visa/card-generator";

export type VisaPaymentInput = {
  pan: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
};

export function parseExpiryInput(raw: string): {
  expiryMonth: number;
  expiryYear: number;
} | null {
  const cleaned = raw.replace(/\D/g, "");
  if (cleaned.length === 4) {
    const expiryMonth = Number(cleaned.slice(0, 2));
    const yy = Number(cleaned.slice(2, 4));
    if (expiryMonth < 1 || expiryMonth > 12) return null;
    return { expiryMonth, expiryYear: 2000 + yy };
  }
  const match = raw.trim().match(/^(\d{1,2})\s*\/\s*(\d{2,4})$/);
  if (!match) return null;
  const expiryMonth = Number(match[1]);
  let expiryYear = Number(match[2]);
  if (expiryMonth < 1 || expiryMonth > 12) return null;
  if (expiryYear < 100) expiryYear += 2000;
  return { expiryMonth, expiryYear };
}

/** Vérifie PAN, expiration et CVV contre la carte Visa M-Pesa de l'invité (BD + dérivé guestId). */
export function assertVisaPayment(
  guestId: string,
  payment: VisaPaymentInput,
): void {
  const expected = generateVisaCardDetails(guestId);
  const pan = payment.pan.replace(/\D/g, "");

  if (pan.length !== 16) {
    throw new Error("Le numéro de carte doit contenir 16 chiffres.");
  }
  if (pan !== expected.pan16) {
    throw new Error("Numéro de carte incorrect.");
  }

  if (
    payment.expiryMonth !== expected.expiryMonth ||
    payment.expiryYear !== expected.expiryYear
  ) {
    throw new Error("Date d'expiration incorrecte.");
  }

  const cvv = payment.cvv.replace(/\D/g, "");
  if (cvv.length !== 3 || cvv !== expected.cvv) {
    throw new Error("Code CVV incorrect.");
  }
}
