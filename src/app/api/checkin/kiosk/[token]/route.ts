import { NextResponse } from "next/server";
import { getKioskGuestState } from "@/lib/checkin/kiosk-service";
import { databaseErrorResponse } from "@/lib/prisma-errors";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { token } = await params;
    const state = await getKioskGuestState(token);
    if (!state) {
      return NextResponse.json({ error: "Session introuvable." }, { status: 404 });
    }
    return NextResponse.json(state);
  } catch (e) {
    const db = databaseErrorResponse(e);
    if (db) return db;
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
