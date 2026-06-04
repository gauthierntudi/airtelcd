import fs from "fs";
import path from "path";
import { EVENT } from "@/lib/event";
import { INVITATION_HERO_IMAGE_URL } from "@/lib/invitation-assets";
import { invitationQrCodeImageUrl } from "@/lib/invitation-qr";

export const INVITATION_EMAIL_HERO_URL = INVITATION_HERO_IMAGE_URL;

export type InvitationEmailTemplateParams = {
  firstName: string;
  displayName: string;
  invitationUrl: string;
};

const TEMPLATE_REL = path.join("public", "tamplate-email", "email_template.html");

function escapeHtmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Attributs href/src — préserve les & des URLs. */
function escapeHtmlAttr(text: string): string {
  return text.replace(/"/g, "&quot;");
}

function loadTemplate(): string {
  const filePath = path.join(process.cwd(), TEMPLATE_REL);
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Rendu du template `public/tamplate-email/email_template.html`.
 * - {{hero_image_url}} : bannière Cloudinary en tête
 * - {{qr_code_url}} : QR 200×200 dans .qr-code-container uniquement
 */
export function renderInvitationEmailFromTemplate(
  params: InvitationEmailTemplateParams,
): string {
  const subject = `${params.firstName}, votre invitation — ${EVENT.title}`;
  const confirmationUrl = escapeHtmlAttr(params.invitationUrl);
  const qrUrl = escapeHtmlAttr(invitationQrCodeImageUrl(params.invitationUrl));
  const heroUrl = escapeHtmlAttr(INVITATION_EMAIL_HERO_URL);

  const replacements: [string, string][] = [
    ["{{hero_image_url}}", heroUrl],
    ["{{qr_code_url}}", qrUrl],
    ["{{confirmation_url}}", confirmationUrl],
    ["{{subject}}", escapeHtmlText(subject)],
    ["{{name_invite}}", escapeHtmlText(params.displayName)],
    ["{{event_title}}", escapeHtmlText(EVENT.title)],
    ["{{event_date}}", escapeHtmlText(`${EVENT.dateLabel} — ${EVENT.timeLabel}`)],
    ["{{event_venue}}", escapeHtmlText(EVENT.venue)],
  ];

  let html = loadTemplate();
  for (const [token, value] of replacements) {
    html = html.split(token).join(value);
  }

  return html;
}
