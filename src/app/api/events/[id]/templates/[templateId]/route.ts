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

type RouteContext = { params: Promise<{ id: string; templateId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id, templateId } = await context.params;
  const existing = await prisma.eventWhatsAppTemplate.findFirst({
    where: { id: templateId, eventId: id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Template introuvable" }, { status: 404 });
  }

  let body: { kind?: string; label?: string; contentSid?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  let contentSid: string | undefined;
  if (body.contentSid !== undefined) {
    const sid = parseContentSid(body.contentSid);
    if (typeof sid !== "string") {
      return NextResponse.json({ error: sid.error }, { status: 400 });
    }
    contentSid = sid;
  }

  const kind = body.kind;
  if (kind !== undefined && !isWhatsAppTemplateKind(kind)) {
    return NextResponse.json({ error: "Type de template invalide" }, { status: 400 });
  }

  const label = body.label?.trim();

  await prisma.eventWhatsAppTemplate.update({
    where: { id: templateId },
    data: {
      ...(kind && { kind }),
      ...(label && { label }),
      ...(kind && !label && { label: WHATSAPP_TEMPLATE_KIND_META[kind].label }),
      ...(contentSid && { contentSid }),
    },
  });

  const event = await prisma.event.findUniqueOrThrow({
    where: { id },
    include: eventInclude,
  });
  return NextResponse.json(serializeEvent(event));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id, templateId } = await context.params;
  const existing = await prisma.eventWhatsAppTemplate.findFirst({
    where: { id: templateId, eventId: id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Template introuvable" }, { status: 404 });
  }

  await prisma.eventWhatsAppTemplate.delete({ where: { id: templateId } });

  const event = await prisma.event.findUniqueOrThrow({
    where: { id },
    include: eventInclude,
  });
  return NextResponse.json(serializeEvent(event));
}
