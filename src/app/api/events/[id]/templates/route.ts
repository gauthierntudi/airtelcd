import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import {
  isWhatsAppTemplateKind,
  parseContentSid,
  serializeEvent,
  WHATSAPP_TEMPLATE_KIND_META,
} from "@/lib/events";
import { prisma } from "@/lib/prisma";

const eventInclude = {
  templates: { orderBy: { createdAt: "asc" as const } },
  _count: { select: { guests: true } },
};

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await context.params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  let body: { kind?: string; label?: string; contentSid?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (!isWhatsAppTemplateKind(body.kind)) {
    return NextResponse.json({ error: "Type de template invalide" }, { status: 400 });
  }

  const sid = parseContentSid(body.contentSid);
  if (typeof sid !== "string") {
    return NextResponse.json({ error: sid.error }, { status: 400 });
  }

  const defaultLabel = WHATSAPP_TEMPLATE_KIND_META[body.kind].label;
  const label = body.label?.trim() || defaultLabel;
  if (!label) {
    return NextResponse.json({ error: "Libellé requis" }, { status: 400 });
  }

  await prisma.eventWhatsAppTemplate.create({
    data: {
      eventId: id,
      kind: body.kind,
      label,
      contentSid: sid,
    },
  });

  const updated = await prisma.event.findUniqueOrThrow({
    where: { id },
    include: eventInclude,
  });
  return NextResponse.json(serializeEvent(updated), { status: 201 });
}
