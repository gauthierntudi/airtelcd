import type { InvitationAccessChannel } from "@/lib/invitation-access/types";
import {
  getMessagingConfig,
  isOtpSmsChannelConfigured,
  isTwilioSmsConfigured,
  isTwilioVerifyConfigured,
} from "@/lib/messaging/config";
import { startTwilioVerifySms } from "@/lib/messaging/twilio-verify";
import {
  assertTwilioSmsConfigured,
  sendTwilioSmsMessage,
} from "@/lib/messaging/send-twilio-sms";
import {
  otpEmailPlainText,
  otpEmailSubject,
  renderOtpEmailFromTemplate,
} from "@/lib/messaging/otp-email-template";
export function isOtpEmailConfigured(): boolean {
  const { brevo } = getMessagingConfig();
  return Boolean(brevo.apiKey && brevo.senderEmail);
}

export function isOtpSmsConfigured(): boolean {
  return isOtpSmsChannelConfigured();
}

function assertOtpEmailConfigured(): void {
  if (!isOtpEmailConfigured()) {
    throw new Error(
      "Envoi email impossible : BREVO_API_KEY et BREVO_SENDER_EMAIL requis.",
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
  if (isTwilioVerifyConfigured()) {
    await startTwilioVerifySms(params.phoneE164);
    return;
  }
  assertTwilioSmsConfigured();
  await sendTwilioSmsMessage({
    phoneE164: params.phoneE164,
    body: `Bonjour ${params.firstName}, votre code Vodacom Privilège Golf : ${params.code} (valide 10 min).`,
  });
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
