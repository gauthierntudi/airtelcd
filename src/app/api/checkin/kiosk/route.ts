import { NextResponse } from "next/server";
import { getKioskDisplayState } from "@/lib/checkin/kiosk-service";
import { getAppBaseUrl } from "@/lib/invitation-url";
import { databaseErrorResponse } from "@/lib/prisma-errors";

export async function GET(req: Request) {
  try {
    const baseUrl = getAppBaseUrl(new URL(req.url).origin);
    const state = await getKioskDisplayState(baseUrl);
    return NextResponse.json(state);
  } catch (e) {
    const db = databaseErrorResponse(e);
    if (db) return db;
    console.error("[checkin/kiosk GET]", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
