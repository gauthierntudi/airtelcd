import { assertChannelConfigured, getMessagingConfig } from "@/lib/messaging/config";
import {
  invitationEmailHtml,
  invitationEmailSubject,
} from "@/lib/messaging/invitation-content";
import type { InvitationEmailRenderParams } from "@/lib/messaging/invitation-email-vars";

export async function sendInvitationEmail(
  params: InvitationEmailRenderParams & { email: string },
): Promise<void> {
  assertChannelConfigured("email");
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
      to: [{ email: params.email, name: params.displayName }],
      subject: invitationEmailSubject(params),
      htmlContent: invitationEmailHtml(params),
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
