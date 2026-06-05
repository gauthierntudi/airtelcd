import { NextResponse } from "next/server";
import {
  getMpesaGuestFromCookies,
  getMpesaGuestIdFromCookies,
} from "@/lib/mpesa-visa/guest-from-request";
import {
  createMpesaVisaCard,
  deleteMpesaVisaCard,
  getMpesaVisaExperienceState,
  purchaseCarrefourProduct,
  setMpesaVisaCardBlocked,
} from "@/lib/mpesa-visa/service";
import { databaseErrorResponse } from "@/lib/prisma-errors";
import type { UssdPersistAction } from "@/lib/mpesa-ussd/side-effects";

export async function GET() {
  try {
    const guestId = await getMpesaGuestIdFromCookies();
    if (!guestId) {
      return NextResponse.json(
        { error: "Connectez-vous via OTP pour accéder à Carte Visa M-Pesa." },
        { status: 401 },
      );
    }

    const state = await getMpesaVisaExperienceState(guestId);
    if (!state) {
      return NextResponse.json({ error: "Invité introuvable." }, { status: 404 });
    }

    return NextResponse.json(state);
  } catch (e) {
    const db = databaseErrorResponse(e);
    if (db) return db;
    console.error("[mpesa/visa GET]", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guest = await getMpesaGuestFromCookies();
  if (!guest) {
    return NextResponse.json(
      { error: "Connectez-vous via OTP pour accéder à Carte Visa M-Pesa." },
      { status: 401 },
    );
  }

  let body: UssdPersistAction;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  try {
    let state;
    switch (body.type) {
      case "create_card":
        state = await createMpesaVisaCard(guest.id);
        break;
      case "delete_card":
        state = await deleteMpesaVisaCard(guest.id);
        break;
      case "block_card":
        state = await setMpesaVisaCardBlocked(guest.id, true);
        break;
      case "unblock_card":
        state = await setMpesaVisaCardBlocked(guest.id, false);
        break;
      case "purchase":
        state = await purchaseCarrefourProduct(guest.id, body.productId);
        break;
      default:
        return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
    }
    return NextResponse.json(state);
  } catch (e) {
    const db = databaseErrorResponse(e);
    if (db) return db;
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
