import fs from "fs";
import path from "path";
import { EVENT } from "@/lib/event";
import { getAppBaseUrl } from "@/lib/invitation-url";
import { INVITATION_EMAIL_HERO_URL } from "@/lib/messaging/email-template";

const TEMPLATE_REL = path.join(
  "public",
  "tamplate-email",
  "otp_email_template.html",
);

export type OtpEmailTemplateParams = {
  firstName: string;
  code: string;
};

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
  return fs.readFileSync(path.join(process.cwd(), TEMPLATE_REL), "utf-8");
}

function renderCodeCells(code: string): string {
  const digits = code.replace(/\D/g, "").padStart(6, "0").slice(-6);
  return digits
    .split("")
    .map(
      (digit) => `
    <td align="center" style="width:44px;height:52px;padding:0 4px;">
      <div style="width:44px;height:52px;line-height:52px;background-color:#fafafa;border:2px solid #e8e8e8;border-radius:10px;font-size:28px;font-weight:bold;font-family:'Courier New',Courier,monospace;color:#e60000;text-align:center;">
        ${escapeHtmlText(digit)}
      </div>
    </td>`,
    )
    .join("");
}

export function otpEmailSubject(firstName: string): string {
  return `${firstName}, votre code d'accès — ${EVENT.title}`;
}

export function otpEmailPlainText(params: OtpEmailTemplateParams): string {
  const digits = params.code.replace(/\D/g, "").slice(0, 6);
  return [
    `Bonjour ${params.firstName},`,
    ``,
    `Votre code de confirmation pour accéder à votre invitation ${EVENT.title} :`,
    ``,
    digits,
    ``,
    `Ce code expire dans 10 minutes. Ne le partagez avec personne.`,
    ``,
    `Accéder à la plateforme : ${getAppBaseUrl()}`,
    ``,
    `— ${EVENT.organizer}`,
  ].join("\n");
}

/** HTML OTP — template `public/tamplate-email/otp_email_template.html` */
export function renderOtpEmailFromTemplate(params: OtpEmailTemplateParams): string {
  const subject = otpEmailSubject(params.firstName);
  const replacements: [string, string][] = [
    ["{{subject}}", escapeHtmlText(subject)],
    ["{{first_name}}", escapeHtmlText(params.firstName)],
    ["{{event_title}}", escapeHtmlText(EVENT.title)],
    ["{{hero_image_url}}", escapeHtmlAttr(INVITATION_EMAIL_HERO_URL)],
    ["{{app_url}}", escapeHtmlAttr(getAppBaseUrl())],
    ["{{contact_email}}", escapeHtmlAttr(EVENT.contactEmail)],
    ["{{code_cells}}", renderCodeCells(params.code)],
  ];

  let html = loadTemplate();
  for (const [token, value] of replacements) {
    html = html.split(token).join(value);
  }
  return html;
}
