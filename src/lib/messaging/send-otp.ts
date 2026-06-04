import type { InvitationAccessChannel } from "@/lib/invitation-access/types";
import {
  getMessagingConfig,
  isTwilioSmsConfigured,
} from "@/lib/messaging/config";
import {
  otpEmailPlainText,
  otpEmailSubject,
  renderOtpEmailFromTemplate,
} from "@/lib/messaging/otp-email-template";
import twilio from "twilio";

export function isOtpEmailConfigured(): boolean {
  const { brevo } = getMessagingConfig();
  return Boolean(brevo.apiKey && brevo.senderEmail);
}

export function isOtpSmsConfigured(): boolean {
  return isTwilioSmsConfigured();
}

function assertOtpEmailConfigured(): void {
  if (!isOtpEmailConfigured()) {
    throw new Error(
      "Envoi email impossible : BREVO_API_KEY et BREVO_SENDER_EMAIL requis.",
    );
  }
}

function assertOtpSmsConfigured(): void {
  if (!isOtpSmsConfigured()) {
    throw new Error(
      "Envoi SMS impossible : TWILIO_SMS_ACCOUNT_SID, TWILIO_SMS_AUTH_TOKEN et TWILIO_SMS_FROM requis.",
    );
  }
}

export async function sendOtpEmail(params: {
  email: string;
  firstName: string;
  code: string;
}): Promise<void> {
  assertOtpEmailConfigured();
  const { brevo } = getMessagingConfig();

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevo.apiKey!,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: brevo.senderName,
        email: brevo.senderEmail,
      },
      to: [{ email: params.email, name: params.firstName }],
      subject: otpEmailSubject(params.firstName),
      htmlContent: renderOtpEmailFromTemplate({
        firstName: params.firstName,
        code: params.code,
      }),
      textContent: otpEmailPlainText({
        firstName: params.firstName,
        code: params.code,
      }),
    }),
  });

  if (!res.ok) {
    let detail = await res.text();
    try {
      const json = JSON.parse(detail) as { message?: string };
      detail = json.message ?? detail;
    } catch {
      /* keep raw */
    }
    throw new Error(`Brevo : ${detail}`);
  }
}

export async function sendOtpSms(params: {
  phoneE164: string;
  firstName: string;
  code: string;
}): Promise<void> {
  assertOtpSmsConfigured();
  const { sms: cfg } = getMessagingConfig().twilio;

  const client = twilio(cfg.accountSid!, cfg.authToken!);
  const from = cfg.from!;

  try {
    await client.messages.create({
      from,
      to: params.phoneE164,
      body: `Bonjour ${params.firstName}, votre code Vodacom Privilege Golf : ${params.code} (valide 10 min).`,
    });
  } catch (e) {
    const detail =
      e && typeof e === "object" && "message" in e
        ? String((e as { message: unknown }).message)
        : "échec Twilio";
    throw new Error(`SMS non envoyé : ${detail}`);
  }
}

export async function deliverOtpCode(params: {
  channel: InvitationAccessChannel;
  address: string;
  firstName: string;
  code: string;
}): Promise<void> {
  if (params.channel === "email") {
    await sendOtpEmail({
      email: params.address,
      firstName: params.firstName,
      code: params.code,
    });
    return;
  }
  await sendOtpSms({
    phoneE164: params.address,
    firstName: params.firstName,
    code: params.code,
  });
}

export function canDeliverOtp(channel: InvitationAccessChannel): boolean {
  if (channel === "email") return isOtpEmailConfigured();
  return isOtpSmsConfigured();
}
