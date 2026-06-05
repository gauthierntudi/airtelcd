import type { ContactChannel } from "@/lib/guest-contact";
import type { GuestContactFields } from "@/lib/guest-contact";
import type { MessagingStatus } from "@/lib/messaging/config";
import {
  isBrevoConfigured,
  isTwilioWhatsappConfigured,
} from "@/lib/messaging/config";
import type { InvitationEmailVariant } from "@/lib/messaging/invitation-email-vars";

export type SendChannelSelection = {
  email: boolean;
  whatsapp: boolean;
};

export type SendInvitationOptions = {
  channels: SendChannelSelection;
  emailTemplate: InvitationEmailVariant;
};

export type SendApiContext = Pick<MessagingStatus, "brevo" | "twilioWhatsapp">;

export const DEFAULT_SEND_OPTIONS: SendInvitationOptions = {
  channels: { email: true, whatsapp: true },
  emailTemplate: "nominative",
};

export function parseSendChannelSelection(
  value: SendChannelSelection | undefined,
): ContactChannel[] {
  const channels: ContactChannel[] = [];
  if (value?.email) channels.push("email");
  if (value?.whatsapp) channels.push("whatsapp");
  return channels;
}

/** Canaux réellement envoyables pour un invité (contact + API). */
export function getGuestAvailableChannels(
  guest: GuestContactFields,
  apis?: SendApiContext,
): ContactChannel[] {
  const brevoOk = apis?.brevo ?? isBrevoConfigured();
  const whatsappOk = apis?.twilioWhatsapp ?? isTwilioWhatsappConfigured();
  const channels: ContactChannel[] = [];
  if (guest.email?.trim() && brevoOk) channels.push("email");
  if (guest.phone?.trim() && whatsappOk) channels.push("whatsapp");
  return channels;
}

export function resolveGuestSendChannels(
  guest: GuestContactFields,
  selection: SendChannelSelection,
  apis?: SendApiContext,
): ContactChannel[] {
  const requested = parseSendChannelSelection(selection);
  const available = getGuestAvailableChannels(guest, apis);
  return requested.filter((c) => available.includes(c));
}

export function canSendGuestWithOptions(
  guest: GuestContactFields,
  options: SendInvitationOptions,
  apis?: SendApiContext,
): boolean {
  return resolveGuestSendChannels(guest, options.channels, apis).length > 0;
}

/** Message explicite pour l'admin (client ou serveur). */
export function getGuestSendBlockReason(
  guest: GuestContactFields,
  options: SendInvitationOptions,
  apis?: SendApiContext,
): string | null {
  if (!options.channels.email && !options.channels.whatsapp) {
    return "Sélectionnez au moins un canal : email et/ou WhatsApp.";
  }

  if (canSendGuestWithOptions(guest, options, apis)) return null;

  const brevoOk = apis?.brevo ?? isBrevoConfigured();
  const whatsappOk = apis?.twilioWhatsapp ?? isTwilioWhatsappConfigured();

  if (options.channels.email && !guest.email?.trim()) {
    return "Cet invité n'a pas d'adresse e-mail.";
  }
  if (options.channels.email && guest.email?.trim() && !brevoOk) {
    return "Brevo non configuré — envoi email indisponible.";
  }

  if (options.channels.whatsapp && !guest.phone?.trim()) {
    return "Cet invité n'a pas de numéro WhatsApp.";
  }
  if (options.channels.whatsapp && guest.phone?.trim() && !whatsappOk) {
    return "Twilio WhatsApp non configuré.";
  }

  return "Envoi impossible avec les canaux sélectionnés.";
}

export function assertSendOptions(
  guest: GuestContactFields,
  options: SendInvitationOptions,
): ContactChannel[] {
  const channels = resolveGuestSendChannels(guest, options.channels);
  const reason = getGuestSendBlockReason(guest, options);
  if (reason) throw new Error(reason);
  return channels;
}

export function parseSendInvitationOptions(
  body:
    | {
        channels?: Partial<SendChannelSelection>;
        emailTemplate?: string;
      }
    | null
    | undefined,
): SendInvitationOptions {
  const channels = body?.channels;
  const emailTemplate =
    body?.emailTemplate === "simple" ? "simple" : "nominative";

  return {
    channels: {
      email:
        channels?.email !== undefined
          ? Boolean(channels.email)
          : DEFAULT_SEND_OPTIONS.channels.email,
      whatsapp:
        channels?.whatsapp !== undefined
          ? Boolean(channels.whatsapp)
          : DEFAULT_SEND_OPTIONS.channels.whatsapp,
    },
    emailTemplate,
  };
}
