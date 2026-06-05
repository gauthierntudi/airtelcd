import type { Guest } from "@prisma/client";
import type { ContactChannel } from "@/lib/guest-contact";
import { getMessagingStatus } from "@/lib/messaging/config";
import { sendInvitationEmail } from "@/lib/messaging/brevo";
import { buildInvitationEmailParams } from "@/lib/messaging/invitation-email-vars";
import {
  assertSendOptions,
  type SendInvitationOptions,
} from "@/lib/messaging/send-options";
import { sendInvitationWhatsApp } from "@/lib/messaging/twilio-whatsapp";
import { guestDisplayName } from "@/lib/event";
import { prisma } from "@/lib/prisma";

export type InvitationSentVia = ContactChannel | "both";

export type SendInvitationResult = {
  guestId: string;
  channels: ContactChannel[];
  channel: InvitationSentVia;
  sentAt: string;
  warnings?: string[];
};

function invitationSentViaValue(channels: ContactChannel[]): InvitationSentVia {
  if (channels.length >= 2) return "both";
  return channels[0]!;
}

async function sendOnChannel(
  channel: ContactChannel,
  guest: Guest,
  baseUrl: string,
  options: SendInvitationOptions,
): Promise<void> {
  if (channel === "email") {
    const emailParams = buildInvitationEmailParams(
      guest,
      baseUrl,
      options.emailTemplate,
    );
    await sendInvitationEmail({
      ...emailParams,
      email: guest.email!.trim(),
    });
    return;
  }

  await sendInvitationWhatsApp({
    phoneE164: guest.phone!,
    displayName: guestDisplayName(guest.firstName, guest.lastName),
    invitationToken: guest.token,
  });
}

export async function sendInvitationToGuest(
  guest: Guest,
  baseUrl: string,
  options: SendInvitationOptions,
): Promise<SendInvitationResult> {
  if (!getMessagingStatus().canSendAny) {
    throw new Error(
      "Envoi désactivé : configurez Brevo (email) et/ou Twilio (WhatsApp) dans .env",
    );
  }

  const channels = assertSendOptions(guest, options);

  const results = await Promise.allSettled(
    channels.map((channel) => sendOnChannel(channel, guest, baseUrl, options)),
  );

  const succeeded = channels.filter((_, i) => results[i]?.status === "fulfilled");
  const failed = channels
    .map((channel, i) => {
      const result = results[i];
      if (result?.status === "rejected") {
        const reason =
          result.reason instanceof Error
            ? result.reason.message
            : "Erreur d'envoi";
        return `${channel}: ${reason}`;
      }
      return null;
    })
    .filter((entry): entry is string => entry !== null);

  if (succeeded.length === 0) {
    throw new Error(failed.join(" · ") || "Erreur d'envoi");
  }

  const sentAt = new Date();
  const sentVia = invitationSentViaValue(succeeded);

  await prisma.guest.update({
    where: { id: guest.id },
    data: {
      invitationSentAt: sentAt,
      invitationSentVia: sentVia,
    },
  });

  return {
    guestId: guest.id,
    channels: succeeded,
    channel: sentVia,
    sentAt: sentAt.toISOString(),
    warnings: failed.length > 0 ? failed : undefined,
  };
}

export type BulkSendResult = {
  sent: SendInvitationResult[];
  failed: { guestId: string; displayName: string; error: string }[];
};

export async function sendInvitationsBulk(
  guests: Guest[],
  baseUrl: string,
  options: SendInvitationOptions,
): Promise<BulkSendResult> {
  const sent: SendInvitationResult[] = [];
  const failed: BulkSendResult["failed"] = [];

  for (const guest of guests) {
    const displayName = guestDisplayName(guest.firstName, guest.lastName);
    try {
      const result = await sendInvitationToGuest(guest, baseUrl, options);
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
