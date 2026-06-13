import { NextResponse } from "next/server";
import { authenticateExperienceAccess } from "@/lib/experience-access/service";
import type { InvitationAccessChannel } from "@/lib/invitation-access/types";
import {
  createInvitationSessionValue,
  INVITATION_SESSION_COOKIE,
  invitationSessionCookieOptions,
} from "@/lib/invitation-access/session";

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
    const result = await authenticateExperienceAccess({ channel, contact });
    const response = NextResponse.json({
      guestId: result.guestId,
      walkIn: result.walkIn,
    });
    response.cookies.set(
      INVITATION_SESSION_COOKIE,
      createInvitationSessionValue(result.guestId),
      invitationSessionCookieOptions(),
    );
    return response;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
