export const EVENT = {
  title: "Vodacom Privilège Golf 2026",
  dateLabel: "Du 12 au 14 juin 2026",
  timeLabel: "08h00 à 17h00",
  venue: "Golf Club de Kinshasa, Gombe",
  dressCode: "Casual golf / Polo",
  contactEmail: "contact@vodacomprivilege.com",
  contactPhone: "+243 81 000 0000",
  organizer: "Vodacom Privilège",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Golf+Club+de+Kinshasa+Gombe",
} as const;

export const GUEST_NAME_FALLBACK = "Invité";

export function normalizeGuestFullName(
  fullName: string | null | undefined,
): string | null {
  const trimmed = fullName?.trim();
  return trimmed || null;
}

export function hasGuestFullName(
  fullName: string | null | undefined,
): boolean {
  return Boolean(normalizeGuestFullName(fullName));
}

/** Premier mot du nom complet (salutations « Jean, »). */
export function guestFirstWord(
  fullName: string | null | undefined,
): string | null {
  const full = normalizeGuestFullName(fullName);
  if (!full) return null;
  return full.split(/\s+/)[0] ?? null;
}

export function guestDisplayName(
  fullName: string | null | undefined,
): string {
  return normalizeGuestFullName(fullName) ?? GUEST_NAME_FALLBACK;
}

/** Nom complet pour la page invitation — `null` si absent (pas de « Invité »). */
export function guestInvitationDisplayName(
  fullName: string | null | undefined,
): string | null {
  return normalizeGuestFullName(fullName);
}

/** Libellé court (1er mot ou repli) — emails OTP, boutons invitation. */
export function guestFirstNameLabel(
  fullName: string | null | undefined,
): string {
  return guestFirstWord(fullName) ?? GUEST_NAME_FALLBACK;
}

/** « Jean, » ou chaîne vide si pas de nom — textes page invitation. */
export function guestSalutationPrefix(
  fullName: string | null | undefined,
): string {
  const first = guestFirstWord(fullName);
  return first ? `${first}, ` : "";
}

/** Affichage admin : nom complet, sinon email/téléphone. */
export function guestAdminDisplayName(guest: {
  fullName: string | null;
  email: string | null;
  phone: string | null;
}): string {
  const full = guestDisplayName(guest.fullName);
  if (full !== GUEST_NAME_FALLBACK) return full;
  return guest.email?.trim() || guest.phone?.trim() || GUEST_NAME_FALLBACK;
}

export function guestInitials(fullName: string | null | undefined): string {
  const parts = normalizeGuestFullName(fullName)?.split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}
