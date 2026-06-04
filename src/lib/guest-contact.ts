export type ContactChannel = "email" | "whatsapp";

export type GuestContactFields = {
  email: string | null;
  phone: string | null;
};

/** Canaux disponibles pour contacter l’invité */
export function getGuestContactChannels(
  guest: GuestContactFields,
): ContactChannel[] {
  const channels: ContactChannel[] = [];
  if (guest.email?.trim()) channels.push("email");
  if (guest.phone?.trim()) channels.push("whatsapp");
  return channels;
}

/**
 * Canal prioritaire pour l’envoi de messages :
 * email si présent, sinon WhatsApp si numéro E.164 valide en base.
 */
export function getPreferredMessageChannel(
  guest: GuestContactFields,
): ContactChannel | null {
  if (guest.email?.trim()) return "email";
  if (guest.phone?.trim()) return "whatsapp";
  return null;
}

export function canSendMessage(guest: GuestContactFields): boolean {
  return getPreferredMessageChannel(guest) !== null;
}
