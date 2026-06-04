import twilio from "twilio";
import { assertChannelConfigured, getMessagingConfig } from "@/lib/messaging/config";
import {
  invitationWhatsAppText,
  type InvitationContentParams,
} from "@/lib/messaging/invitation-content";

function toWhatsAppAddress(e164: string): string {
  const digits = e164.startsWith("+") ? e164 : `+${e164}`;
  return `whatsapp:${digits}`;
}

export async function sendInvitationWhatsApp(
  params: InvitationContentParams & { phoneE164: string },
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
    body: invitationWhatsAppText(params),
  });
}
