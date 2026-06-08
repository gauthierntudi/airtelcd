import { generateVisaCardDetails } from "@/lib/mpesa-visa/card-generator";
import { normalizeExpiryYear } from "@/lib/mpesa-visa/expiry-utils";

export type VisaPaymentInput = {
  pan: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
};

export {
  formatExpiryDisplay,
  formatExpiryInput,
  formatExpiryYearTwoDigits,
  normalizeExpiryYear,
  parseExpiryInput,
} from "@/lib/mpesa-visa/expiry-utils";

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
    normalizeExpiryYear(payment.expiryYear) !==
      normalizeExpiryYear(expected.expiryYear)
  ) {
    throw new Error("Date d'expiration incorrecte.");
  }

  const cvv = payment.cvv.replace(/\D/g, "");
  if (cvv.length !== 3 || cvv !== expected.cvv) {
    throw new Error("Code CVV incorrect.");
  }
}
