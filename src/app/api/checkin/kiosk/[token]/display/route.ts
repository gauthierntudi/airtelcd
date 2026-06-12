import { NextResponse } from "next/server";
import { getKioskDisplayStateByToken } from "@/lib/checkin/kiosk-service";
import { getAppBaseUrl } from "@/lib/invitation-url";
import { databaseErrorResponse } from "@/lib/prisma-errors";

type Params = { params: Promise<{ token: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const { token } = await params;
    const baseUrl = getAppBaseUrl(new URL(req.url).origin);
    const state = await getKioskDisplayStateByToken(token, baseUrl);
    return NextResponse.json(state);
  } catch (e) {
    const db = databaseErrorResponse(e);
    if (db) return db;
    const message = e instanceof Error ? e.message : "Erreur";
    const status = message.includes("introuvable") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
