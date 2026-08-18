import twilio from "twilio";
import { assertChannelConfigured, getMessagingConfig } from "@/lib/messaging/config";
import type { InvitationWhatsAppTemplate } from "@/lib/messaging/invitation-whatsapp-vars";

export type InvitationWhatsAppParams = {
  phoneE164: string;
  template: InvitationWhatsAppTemplate;
  contentVariables: Record<string, string>;
};

function resolveContentSid(template: InvitationWhatsAppTemplate): string {
  const { whatsapp: cfg } = getMessagingConfig().twilio;

  if (template === "one_day") {
    const sid = cfg.contentInviteOneDaySid;
    if (!sid) {
      throw new Error(
        "Template WhatsApp 1 jour non configuré : TWILIO_WHATSAPP_CONTENT_INVITE_ONE_DAY_SID ou TWILIO_WHATSAPP_CONTENT_INVITE_SIMPLE_SID requis.",
      );
    }
    return sid;
  }

  const sid = cfg.contentInviteThreeDaysSid;
  if (!sid) {
    throw new Error(
      "Template WhatsApp 3 jours non configuré : TWILIO_WHATSAPP_CONTENT_INVITE_THREE_DAYS_SID ou TWILIO_WHATSAPP_CONTENT_INVITE_NOMINATIVE_SID requis.",
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
    contentSid: resolveContentSid(params.template),
    contentVariables: JSON.stringify(params.contentVariables),
  });
}

export type GenericWhatsAppParams = {
  phoneE164: string;
  contentSid: string;
  contentVariables?: Record<string, string>;
};

/** Template WhatsApp (SID événement ou générique). */
export async function sendGenericWhatsApp(
  params: GenericWhatsAppParams,
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
    contentSid: params.contentSid,
    ...(params.contentVariables
      ? { contentVariables: JSON.stringify(params.contentVariables) }
      : {}),
  });
}
