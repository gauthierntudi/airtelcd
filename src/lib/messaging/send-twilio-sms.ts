import { getMessagingConfig, isTwilioSmsConfigured } from "@/lib/messaging/config";
import twilio from "twilio";

export function assertTwilioSmsConfigured(): void {
  if (!isTwilioSmsConfigured()) {
    throw new Error(
      "Envoi SMS impossible : TWILIO_SMS_ACCOUNT_SID, TWILIO_SMS_AUTH_TOKEN et TWILIO_SMS_FROM requis.",
    );
  }
}

export async function sendTwilioSmsMessage(params: {
  phoneE164: string;
  body: string;
}): Promise<void> {
  assertTwilioSmsConfigured();
  const { sms: cfg } = getMessagingConfig().twilio;
  const client = twilio(cfg.accountSid!, cfg.authToken!);

  try {
    await client.messages.create({
      from: cfg.from!,
      to: params.phoneE164,
      body: params.body,
    });
  } catch (e) {
    const detail =
      e && typeof e === "object" && "message" in e
        ? String((e as { message: unknown }).message)
        : "échec Twilio";
    throw new Error(`SMS non envoyé : ${detail}`);
  }
}
