import { NextResponse } from "next/server";
import { getMpesaGuestIdFromCookies } from "@/lib/mpesa-visa/guest-from-request";
import { confirmTravelerBookingPayment } from "@/lib/mpesa-visa/service";
import type { VisaPaymentInput } from "@/lib/mpesa-visa/validate-payment";
import { parseExpiryInput } from "@/lib/mpesa-visa/validate-payment";
import { databaseErrorResponse } from "@/lib/prisma-errors";

export async function POST(req: Request) {
  const guestId = await getMpesaGuestIdFromCookies();
  if (!guestId) {
    return NextResponse.json(
      { error: "Identifiez-vous pour payer avec Carte Visa M-Pesa." },
      { status: 401 },
    );
  }

  let body: { payment?: Partial<VisaPaymentInput> & { pan?: string; expiry?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const pan = body.payment?.pan?.replace(/\D/g, "") ?? "";
  const expiry = parseExpiryInput(body.payment?.expiry ?? "");
  const cvv = body.payment?.cvv?.replace(/\D/g, "") ?? "";

  if (!pan || !expiry || cvv.length !== 3) {
    return NextResponse.json(
      { error: "Informations de carte incomplètes." },
      { status: 400 },
    );
  }

  const payment: VisaPaymentInput = {
    pan,
    expiryMonth: expiry.expiryMonth,
    expiryYear: expiry.expiryYear,
    cvv,
  };

  try {
    await confirmTravelerBookingPayment(guestId, payment);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const db = databaseErrorResponse(e);
    if (db) return db;
    const message = e instanceof Error ? e.message : "Paiement refusé.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
