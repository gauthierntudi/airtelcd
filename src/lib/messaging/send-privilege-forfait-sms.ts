import { sendTwilioSmsMessage } from "@/lib/messaging/send-twilio-sms";
import { PRIVILEGE_PURCHASED_FORFAIT_BENEFITS } from "@/lib/privilege-onboarding";

export function buildPrivilegeForfaitSmsBody(): string {
  const lines = PRIVILEGE_PURCHASED_FORFAIT_BENEFITS.map(
    (b) => `${b.label}: ${b.value ?? "—"}`,
  );
  return `Vodacom Privilege — Forfait active. ${lines.join(" · ")}`;
}

export async function sendPrivilegeForfaitActivatedSms(params: {
  phoneE164: string;
}): Promise<void> {
  await sendTwilioSmsMessage({
    phoneE164: params.phoneE164,
    body: buildPrivilegeForfaitSmsBody(),
  });
}
