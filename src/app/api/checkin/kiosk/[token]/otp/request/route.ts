import { NextResponse } from "next/server";
import { requestCheckinOtp } from "@/lib/checkin/kiosk-service";
import type { InvitationAccessChannel } from "@/lib/invitation-access/types";
import { databaseErrorResponse } from "@/lib/prisma-errors";

type Params = { params: Promise<{ token: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const { token } = await params;
    let body: { channel?: string; contact?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
    }

    const channel = body.channel as InvitationAccessChannel | undefined;
    const contact = body.contact?.trim();
    if (!contact || (channel !== "email" && channel !== "sms")) {
      return NextResponse.json(
        { error: "Canal et coordonnées requis." },
        { status: 400 },
      );
    }

    const result = await requestCheckinOtp(token, channel, contact);
    return NextResponse.json(result);
  } catch (e) {
    const db = databaseErrorResponse(e);
    if (db) return db;
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
