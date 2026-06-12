import { checkinDayUtcBounds } from "@/lib/checkin/checked-in-day";
import {
  getAdminWhatsAppDay,
  resolveAdminWhatsAppTemplate,
  type AdminWhatsAppDayId,
} from "@/lib/messaging/admin-whatsapp-templates";
import { sendGenericWhatsApp } from "@/lib/messaging/twilio-whatsapp";
import { guestDisplayName } from "@/lib/event";
import { prisma } from "@/lib/prisma";

export type AdminWhatsAppRecipient = {
  id: string;
  displayName: string;
  phone: string;
  checkedInAt: string;
};

export type AdminWhatsAppRecipientsSummary = {
  day: AdminWhatsAppDayId;
  dayLabel: string;
  totalCheckedIn: number;
  withPhone: number;
  recipients: AdminWhatsAppRecipient[];
};

export type AdminWhatsAppSendResult = {
  sent: { guestId: string; displayName: string }[];
  failed: { guestId: string; displayName: string; error: string }[];
  skipped: { guestId: string; displayName: string; reason: string }[];
};

function hasPhone(phone: string | null | undefined): phone is string {
  return Boolean(phone?.trim());
}

export async function listAdminWhatsAppRecipients(
  dayId: AdminWhatsAppDayId,
): Promise<AdminWhatsAppRecipientsSummary> {
  const day = getAdminWhatsAppDay(dayId);
  const { gte, lt } = checkinDayUtcBounds(day.eventDayId);

  const guests = await prisma.guest.findMany({
    where: {
      checkedInAt: { gte, lt },
    },
    orderBy: { checkedInAt: "asc" },
    select: {
      id: true,
      fullName: true,
      phone: true,
      checkedInAt: true,
    },
  });

  const withPhone = guests.filter((g) => hasPhone(g.phone));

  return {
    day: dayId,
    dayLabel: day.label,
    totalCheckedIn: guests.length,
    withPhone: withPhone.length,
    recipients: withPhone.map((guest) => ({
      id: guest.id,
      displayName: guestDisplayName(guest.fullName),
      phone: guest.phone!.trim(),
      checkedInAt: guest.checkedInAt!.toISOString(),
    })),
  };
}

function guestCheckedInOnDay(
  checkedInAt: Date | null | undefined,
  dayId: AdminWhatsAppDayId,
): boolean {
  if (!checkedInAt) return false;
  const { gte, lt } = checkinDayUtcBounds(getAdminWhatsAppDay(dayId).eventDayId);
  const t = checkedInAt.getTime();
  return t >= gte.getTime() && t < lt.getTime();
}

async function sendAdminWhatsAppToGuestRecord(
  guest: {
    id: string;
    fullName: string | null;
    phone: string | null;
    checkedInAt: Date | null;
  },
  dayId: AdminWhatsAppDayId,
  contentSid: string,
): Promise<AdminWhatsAppSendResult> {
  const displayName = guestDisplayName(guest.fullName);
  const sent: AdminWhatsAppSendResult["sent"] = [];
  const failed: AdminWhatsAppSendResult["failed"] = [];
  const skipped: AdminWhatsAppSendResult["skipped"] = [];

  if (!guestCheckedInOnDay(guest.checkedInAt, dayId)) {
    skipped.push({
      guestId: guest.id,
      displayName,
      reason: `Pas de check-in le ${getAdminWhatsAppDay(dayId).label.toLowerCase()}`,
    });
    return { sent, failed, skipped };
  }

  if (!hasPhone(guest.phone)) {
    skipped.push({
      guestId: guest.id,
      displayName,
      reason: "Numéro mobile manquant",
    });
    return { sent, failed, skipped };
  }

  try {
    await sendGenericWhatsApp({
      phoneE164: guest.phone.trim(),
      contentSid,
    });
    sent.push({ guestId: guest.id, displayName });
  } catch (e) {
    failed.push({
      guestId: guest.id,
      displayName,
      error: e instanceof Error ? e.message : "Erreur d'envoi",
    });
  }

  return { sent, failed, skipped };
}

export async function sendAdminWhatsAppToGuest(
  dayId: AdminWhatsAppDayId,
  templateId: string,
  guestId: string,
): Promise<AdminWhatsAppSendResult> {
  const template = resolveAdminWhatsAppTemplate(dayId, templateId);

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: {
      id: true,
      fullName: true,
      phone: true,
      checkedInAt: true,
    },
  });

  if (!guest) {
    throw new Error("Invité introuvable.");
  }

  return sendAdminWhatsAppToGuestRecord(guest, dayId, template.contentSid);
}

export async function sendAdminWhatsAppBulk(
  dayId: AdminWhatsAppDayId,
  templateId: string,
): Promise<AdminWhatsAppSendResult> {
  const template = resolveAdminWhatsAppTemplate(dayId, templateId);
  const summary = await listAdminWhatsAppRecipients(dayId);

  const sent: AdminWhatsAppSendResult["sent"] = [];
  const failed: AdminWhatsAppSendResult["failed"] = [];
  const skipped: AdminWhatsAppSendResult["skipped"] = [];

  const guests = await prisma.guest.findMany({
    where: { id: { in: summary.recipients.map((r) => r.id) } },
    select: {
      id: true,
      fullName: true,
      phone: true,
      checkedInAt: true,
    },
  });

  for (const guest of guests) {
    const result = await sendAdminWhatsAppToGuestRecord(
      guest,
      dayId,
      template.contentSid,
    );
    sent.push(...result.sent);
    failed.push(...result.failed);
    skipped.push(...result.skipped);
  }

  return { sent, failed, skipped };
}
