import twilio from "twilio";
import { assertChannelConfigured, getMessagingConfig } from "@/lib/messaging/config";

export type InvitationWhatsAppParams = {
  phoneE164: string;
  /** {{1}} — nom complet de l'invité */
  displayName: string;
  /** {{2}} — token invitation (URL : …/api/confirm/action={{2}}) */
  invitationToken: string;
};

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
    contentSid: cfg.contentInviteSid!,
    contentVariables: JSON.stringify({
      "1": params.displayName,
      "2": params.invitationToken,
    }),
  });
}
