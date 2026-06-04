import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import { getMessagingStatus } from "@/lib/messaging/config";
import { sendInvitationsBulk } from "@/lib/messaging/send-invitation";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { guestIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const ids = body.guestIds?.filter(Boolean);
  if (!ids?.length) {
    return NextResponse.json(
      { error: "Liste guestIds requise" },
      { status: 400 },
    );
  }

  if (ids.length > 200) {
    return NextResponse.json(
      { error: "Maximum 200 envois par lot" },
      { status: 400 },
    );
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

  const guests = await prisma.guest.findMany({
    where: { id: { in: ids } },
  });

  const baseUrl = request.nextUrl.origin;

  try {
    const result = await sendInvitationsBulk(guests, baseUrl);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur d'envoi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
