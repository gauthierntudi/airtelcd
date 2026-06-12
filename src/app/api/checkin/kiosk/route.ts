import { NextResponse } from "next/server";
import { createKioskDisplaySession } from "@/lib/checkin/kiosk-service";
import { getAppBaseUrl } from "@/lib/invitation-url";
import { databaseErrorResponse } from "@/lib/prisma-errors";

/** Crée une session borne dédiée (multi-écrans). */
export async function POST(req: Request) {
  try {
    const baseUrl = getAppBaseUrl(new URL(req.url).origin);
    const state = await createKioskDisplaySession(baseUrl);
    return NextResponse.json(state, { status: 201 });
  } catch (e) {
    const db = databaseErrorResponse(e);
    if (db) return db;
    console.error("[checkin/kiosk POST]", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
