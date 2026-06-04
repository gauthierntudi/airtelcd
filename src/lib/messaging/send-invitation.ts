import type { Guest } from "@prisma/client";
import type { ContactChannel } from "@/lib/guest-contact";
import {
  assertCanSendInvitation,
  getMessagingStatus,
} from "@/lib/messaging/config";
import { sendInvitationEmail } from "@/lib/messaging/brevo";
import { sendInvitationWhatsApp } from "@/lib/messaging/twilio-whatsapp";
import { guestDisplayName } from "@/lib/event";
import { invitationAbsoluteUrl } from "@/lib/invitation-url";
import { prisma } from "@/lib/prisma";

export type SendInvitationResult = {
  guestId: string;
  channel: ContactChannel;
  sentAt: string;
};

export async function sendInvitationToGuest(
  guest: Guest,
  baseUrl: string,
): Promise<SendInvitationResult> {
  if (!getMessagingStatus().canSendAny) {
    throw new Error(
      "Envoi désactivé : configurez Brevo (email) et/ou Twilio (WhatsApp) dans .env",
    );
  }

  const channel = assertCanSendInvitation(guest);
  const invitationUrl = invitationAbsoluteUrl(guest.token, baseUrl);
  const displayName = guestDisplayName(guest.firstName, guest.lastName);
  const content = {
    firstName: guest.firstName,
    displayName,
    invitationUrl,
  };

  if (channel === "email") {
    await sendInvitationEmail({
      ...content,
      email: guest.email!.trim(),
    });
  } else {
    await sendInvitationWhatsApp({
      ...content,
      phoneE164: guest.phone!,
    });
  }

  const sentAt = new Date();
  await prisma.guest.update({
    where: { id: guest.id },
    data: {
      invitationSentAt: sentAt,
      invitationSentVia: channel,
    },
  });

  return {
    guestId: guest.id,
    channel,
    sentAt: sentAt.toISOString(),
  };
}

export type BulkSendResult = {
  sent: SendInvitationResult[];
  failed: { guestId: string; displayName: string; error: string }[];
};

export async function sendInvitationsBulk(
  guests: Guest[],
  baseUrl: string,
): Promise<BulkSendResult> {
  const sent: SendInvitationResult[] = [];
  const failed: BulkSendResult["failed"] = [];

  for (const guest of guests) {
    const displayName = guestDisplayName(guest.firstName, guest.lastName);
    try {
      const result = await sendInvitationToGuest(guest, baseUrl);
      sent.push(result);
    } catch (e) {
      failed.push({
        guestId: guest.id,
        displayName,
        error: e instanceof Error ? e.message : "Erreur d'envoi",
      });
    }
  }

  return { sent, failed };
}
