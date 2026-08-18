import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import { guestDisplayName } from "@/lib/event";
import {
  buildEventWhatsAppVariables,
  guestsEligibleForTemplateKind,
} from "@/lib/messaging/event-whatsapp";
import { isTwilioWhatsappCredentialsConfigured } from "@/lib/messaging/config";
import { sendGenericWhatsApp } from "@/lib/messaging/twilio-whatsapp";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!isTwilioWhatsappCredentialsConfigured()) {
    return NextResponse.json(
      {
        error:
          "WhatsApp non configuré : TWILIO_WHATSAPP_ACCOUNT_SID, TWILIO_WHATSAPP_AUTH_TOKEN et TWILIO_WHATSAPP_FROM requis.",
      },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { templates: true },
  });
  if (!event) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  let body: { templateId?: string; guestIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const template = event.templates.find((t) => t.id === body.templateId);
  if (!template) {
    return NextResponse.json({ error: "Template introuvable" }, { status: 400 });
  }

  const guests = await prisma.guest.findMany({
    where: {
      eventId: id,
      ...(body.guestIds?.length ? { id: { in: body.guestIds } } : {}),
    },
  });

  const targets = guestsEligibleForTemplateKind(guests, template.kind);
  if (targets.length === 0) {
    return NextResponse.json(
      { error: "Aucun destinataire éligible (numéro WhatsApp requis)" },
      { status: 400 },
    );
  }

  const sent: { guestId: string; displayName: string }[] = [];
  const failed: { guestId: string; displayName: string; error: string }[] = [];

  for (const guest of targets) {
    const displayName = guestDisplayName(guest.fullName);
    try {
      await sendGenericWhatsApp({
        phoneE164: guest.phone!,
        contentSid: template.contentSid,
        contentVariables: buildEventWhatsAppVariables(
          guest,
          event.startDate,
          event.endDate,
        ),
      });
      sent.push({ guestId: guest.id, displayName });
    } catch (e) {
      failed.push({
        guestId: guest.id,
        displayName,
        error: e instanceof Error ? e.message : "Erreur d'envoi",
      });
    }
  }

  return NextResponse.json({
    templateId: template.id,
    kind: template.kind,
    sent,
    failed,
  });
}
