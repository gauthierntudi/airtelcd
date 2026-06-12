import { NextResponse } from "next/server";
import { resetKioskSession } from "@/lib/checkin/kiosk-service";
import { getAppBaseUrl } from "@/lib/invitation-url";
import { databaseErrorResponse } from "@/lib/prisma-errors";

type Params = { params: Promise<{ token: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const { token } = await params;
    const baseUrl = getAppBaseUrl(new URL(req.url).origin);
    const state = await resetKioskSession(token, baseUrl);
    return NextResponse.json(state);
  } catch (e) {
    const db = databaseErrorResponse(e);
    if (db) return db;
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
