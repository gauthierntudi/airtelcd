import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import { getMessagingStatus } from "@/lib/messaging/config";
import { sendInvitationToGuest } from "@/lib/messaging/send-invitation";
import { parseSendInvitationOptions } from "@/lib/messaging/send-options";
import { prisma } from "@/lib/prisma";
import { serializeGuest, guestEventInclude } from "@/lib/serialize-guest";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await context.params;
  const guest = await prisma.guest.findUnique({ where: { id } });
  if (!guest) {
    return NextResponse.json({ error: "Invité introuvable" }, { status: 404 });
  }

  if (!getMessagingStatus().canSendAny) {
    return NextResponse.json(
      {
        error:
          "Envoi désactivé : configurez Brevo (email) et/ou Twilio (WhatsApp) dans .env",
      },
      { status: 503 },
    );
  }

  const baseUrl = request.nextUrl.origin;

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    /* options optionnelles */
  }
  const options = parseSendInvitationOptions(body);

  try {
    const result = await sendInvitationToGuest(guest, baseUrl, options);
    const updated = await prisma.guest.findUniqueOrThrow({
      where: { id },
      include: guestEventInclude,
    });
    return NextResponse.json({
      ...result,
      guest: serializeGuest(updated, baseUrl),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur d'envoi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
