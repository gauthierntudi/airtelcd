import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import { parseAdminWhatsAppDayId } from "@/lib/messaging/admin-whatsapp-templates";
import { getMessagingStatus } from "@/lib/messaging/config";
import {
  listAdminWhatsAppRecipients,
  sendAdminWhatsAppBulk,
  sendAdminWhatsAppToGuest,
} from "@/lib/messaging/send-admin-whatsapp";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const dayId = parseAdminWhatsAppDayId(
    request.nextUrl.searchParams.get("day"),
  );
  if (!dayId) {
    return NextResponse.json(
      { error: "Paramètre day requis (1, 2 ou 3)" },
      { status: 400 },
    );
  }

  const summary = await listAdminWhatsAppRecipients(dayId);
  return NextResponse.json(summary);
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { day?: number; templateId?: string; guestId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const dayId = parseAdminWhatsAppDayId(body.day);
  const templateId = body.templateId?.trim();
  const guestId = body.guestId?.trim();

  if (!dayId || !templateId) {
    return NextResponse.json(
      { error: "Jour (1–3) et templateId requis" },
      { status: 400 },
    );
  }

  if (!getMessagingStatus().twilioWhatsapp) {
    return NextResponse.json(
      {
        error:
          "WhatsApp désactivé : configurez Twilio (TWILIO_WHATSAPP_*) dans .env",
      },
      { status: 503 },
    );
  }

  try {
    const result = guestId
      ? await sendAdminWhatsAppToGuest(dayId, templateId, guestId)
      : await sendAdminWhatsAppBulk(dayId, templateId);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur d'envoi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
