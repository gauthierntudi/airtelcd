import twilio from "twilio";
import { assertChannelConfigured, getMessagingConfig } from "@/lib/messaging/config";
import type { InvitationEmailVariant } from "@/lib/messaging/invitation-email-vars";

export type InvitationWhatsAppParams = {
  phoneE164: string;
  variant: InvitationEmailVariant;
  contentVariables: Record<string, string>;
};

function resolveContentSid(variant: InvitationEmailVariant): string {
  const { whatsapp: cfg } = getMessagingConfig().twilio;

  if (variant === "simple") {
    const sid = cfg.contentInviteSimpleSid;
    if (!sid) {
      throw new Error(
        "Template WhatsApp simple non configuré : TWILIO_WHATSAPP_CONTENT_INVITE_SIMPLE_SID requis.",
      );
    }
    return sid;
  }

  const sid = cfg.contentInviteNominativeSid;
  if (!sid) {
    throw new Error(
      "Template WhatsApp nominatif non configuré : TWILIO_WHATSAPP_CONTENT_INVITE_NOMINATIVE_SID requis.",
    );
  }
  return sid;
}

function toWhatsAppAddress(e164: string): string {
  const digits = e164.startsWith("+") ? e164 : `+${e164}`;
  return `whatsapp:${digits}`;
}

export async function sendInvitationWhatsApp(
  params: InvitationWhatsAppParams,
): Promise<void> {
  assertChannelConfigured("whatsapp");
  const { whatsapp: cfg } = getMessagingConfig().twilio;

  const client = twilio(cfg.accountSid!, cfg.authToken!);
  const from = cfg.from!.startsWith("whatsapp:")
    ? cfg.from!
    : `whatsapp:${cfg.from}`;

  await client.messages.create({
    from,
    to: toWhatsAppAddress(params.phoneE164),
    contentSid: resolveContentSid(params.variant),
    contentVariables: JSON.stringify(params.contentVariables),
  });
}
