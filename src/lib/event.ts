export const EVENT = {
  title: "Vodacom Privilege Golf 2026",
  dateLabel: "Du 12 au 14 juin 2026",
  timeLabel: "08h00 à 17h00",
  venue: "Golf Club de Kinshasa, Gombe",
  dressCode: "Casual golf / Polo",
  contactEmail: "contact@vodacomprivilege.com",
  contactPhone: "+243 81 000 0000",
  organizer: "Vodacom Privilege",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Golf+Club+de+Kinshasa+Gombe",
} as const;

export const AGENDA = [
  { time: "08h00 – 09h00", label: "Accueil & remise du kit participant" },
  { time: "09h00 – 12h00", label: "Début des parties – Round 1" },
  { time: "12h00 – 13h30", label: "Déjeuner et networking" },
  { time: "13h30 – 16h00", label: "Round 2 & concours de précision" },
  { time: "16h00 – 17h00", label: "Remise des prix & clôture" },
] as const;

export const GUEST_NAME_FALLBACK = "Invité";

export function hasGuestFirstName(
  firstName: string | null | undefined,
): boolean {
  return Boolean(firstName?.trim());
}

export function hasGuestLastName(lastName: string | null | undefined): boolean {
  return Boolean(lastName?.trim());
}

/** Prénom et nom renseignés — requis pour confirmer la présence si absent en base. */
export function hasGuestFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): boolean {
  return hasGuestFirstName(firstName) && hasGuestLastName(lastName);
}

export function guestDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const full = `${firstName?.trim() ?? ""} ${lastName?.trim() ?? ""}`.trim();
  return full || GUEST_NAME_FALLBACK;
}

/** Libellé court (prénom ou repli) — emails OTP, boutons invitation. */
export function guestFirstNameLabel(
  firstName: string | null | undefined,
): string {
  return firstName?.trim() || GUEST_NAME_FALLBACK;
}

/** « Jean, » ou chaîne vide si pas de prénom — textes page invitation. */
export function guestSalutationPrefix(
  firstName: string | null | undefined,
): string {
  const first = firstName?.trim();
  return first ? `${first}, ` : "";
}

/** Affichage admin : nom complet, sinon email/téléphone. */
export function guestAdminDisplayName(guest: {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
}): string {
  const full = guestDisplayName(guest.firstName, guest.lastName);
  if (full !== GUEST_NAME_FALLBACK) return full;
  return guest.email?.trim() || guest.phone?.trim() || GUEST_NAME_FALLBACK;
}

export function guestInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "?";
}

export function guestMissingNameFields(guest: {
  firstName: string | null;
  lastName: string | null;
}): { firstName: boolean; lastName: boolean } {
  return {
    firstName: !hasGuestFirstName(guest.firstName),
    lastName: !hasGuestLastName(guest.lastName),
  };
}
