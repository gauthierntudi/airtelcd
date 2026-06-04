import { NextResponse } from "next/server";
import { requestInvitationAccessOtp } from "@/lib/invitation-access/service";
import type { InvitationAccessChannel } from "@/lib/invitation-access/types";

export async function POST(req: Request) {
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

  try {
    const result = await requestInvitationAccessOtp({ channel, contact });
    const payload: { message: string; devCode?: string } = {
      message: result.message,
    };
    if (process.env.NODE_ENV === "development" && result.devCode) {
      payload.devCode = result.devCode;
    }
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
