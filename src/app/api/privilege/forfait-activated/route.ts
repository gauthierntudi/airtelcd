import { NextResponse } from "next/server";
import { getMpesaGuestIdFromCookies } from "@/lib/mpesa-visa/guest-from-request";
import { activatePrivilegeForfait } from "@/lib/mpesa-visa/service";
import { databaseErrorResponse } from "@/lib/prisma-errors";

export async function POST() {
  try {
    const guestId = await getMpesaGuestIdFromCookies();
    if (!guestId) {
      return NextResponse.json(
        { error: "Identifiez-vous pour activer le forfait." },
        { status: 401 },
      );
    }

    const result = await activatePrivilegeForfait(guestId);
    return NextResponse.json(result);
  } catch (e) {
    const db = databaseErrorResponse(e);
    if (db) return db;
    console.error("[privilege/forfait-activated]", e);
    const message = e instanceof Error ? e.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
