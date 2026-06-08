import fs from "fs";
import path from "path";
import { INVITATION_HERO_IMAGE_URL } from "@/lib/invitation-assets";
import { invitationQrCodeImageUrl } from "@/lib/invitation-qr";
import {
  INVITATION_EXPERIENCE,
  type InvitationEmailRenderParams,
} from "@/lib/messaging/invitation-email-vars";

export const INVITATION_EMAIL_HERO_URL = INVITATION_HERO_IMAGE_URL;

const TEMPLATE_FILE = path.join(
  "public",
  "tamplate-email",
  "email_template_simple.html",
);

function escapeHtmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtmlAttr(text: string): string {
  return text.replace(/"/g, "&quot;");
}

function loadTemplate(): string {
  const filePath = path.join(process.cwd(), TEMPLATE_FILE);
  return fs.readFileSync(filePath, "utf-8");
}

export function invitationEmailSubject(
  _params: InvitationEmailRenderParams,
): string {
  return `Votre invitation — ${INVITATION_EXPERIENCE.title}`;
}

export function renderInvitationEmailFromTemplate(
  params: InvitationEmailRenderParams,
): string {
  const subject = invitationEmailSubject(params);
  /** URL unique : bouton, lien sur le QR et données scannées */
  const confirmationUrlRaw = params.invitationUrl;
  const confirmationUrl = escapeHtmlAttr(confirmationUrlRaw);
  const qrUrl = escapeHtmlAttr(invitationQrCodeImageUrl(confirmationUrlRaw));
  const heroUrl = escapeHtmlAttr(INVITATION_EMAIL_HERO_URL);

  const replacements: [string, string][] = [
    ["{{hero_image_url}}", heroUrl],
    ["{{qr_code_url}}", qrUrl],
    ["{{confirmation_url}}", confirmationUrl],
    ["{{subject}}", escapeHtmlText(subject)],
    ["{{guest_name}}", escapeHtmlText(params.displayName)],
    ["{{event_dates}}", escapeHtmlText(params.eventDates)],
    ["{{event_time}}", escapeHtmlText(params.eventTime)],
    ["{{event_venue}}", escapeHtmlText(params.venue)],
  ];

  let html = loadTemplate();
  for (const [token, value] of replacements) {
    html = html.split(token).join(value);
  }

  return html;
}
