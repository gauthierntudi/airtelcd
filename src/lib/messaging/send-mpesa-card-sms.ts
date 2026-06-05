import { sendTwilioSmsMessage } from "@/lib/messaging/send-twilio-sms";

export async function sendMpesaCardCredentialsSms(params: {
  phoneE164: string;
  pan16: string;
  expiryDisplay: string;
  cvv: string;
}): Promise<void> {
  const body = `Congratulations, Your Mpesa Visa card has been successfully created. Card number: ${params.pan16} Expiration date: ${params.expiryDisplay} CVV Code: ${params.cvv}`;

  await sendTwilioSmsMessage({
    phoneE164: params.phoneE164,
    body,
  });
}
