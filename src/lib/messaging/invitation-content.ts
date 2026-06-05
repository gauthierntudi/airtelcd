import {
  INVITATION_EMAIL_HERO_URL,
  invitationEmailSubject,
  renderInvitationEmailFromTemplate,
} from "@/lib/messaging/email-template";
import type { InvitationEmailRenderParams } from "@/lib/messaging/invitation-email-vars";

export { INVITATION_EMAIL_HERO_URL };

export function invitationEmailHtml(params: InvitationEmailRenderParams): string {
  return renderInvitationEmailFromTemplate(params);
}

export { invitationEmailSubject };
