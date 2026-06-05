import { NextResponse } from "next/server";
import { markKioskScanned } from "@/lib/checkin/kiosk-service";
import { databaseErrorResponse } from "@/lib/prisma-errors";

type Params = { params: Promise<{ token: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const { token } = await params;
    const state = await markKioskScanned(token);
    return NextResponse.json(state);
  } catch (e) {
    const db = databaseErrorResponse(e);
    if (db) return db;
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
