import { EVENT } from "@/lib/event";
import {
  INVITATION_EMAIL_HERO_URL,
  renderInvitationEmailFromTemplate,
} from "@/lib/messaging/email-template";

export { INVITATION_EMAIL_HERO_URL };

export type InvitationContentParams = {
  firstName: string;
  displayName: string;
  invitationUrl: string;
};

export function invitationEmailSubject(firstName: string): string {
  return `${firstName}, votre invitation — ${EVENT.title}`;
}

/** HTML invitation — template `public/tamplate-email/email_template.html` */
export function invitationEmailHtml(params: InvitationContentParams): string {
  return renderInvitationEmailFromTemplate(params);
}

