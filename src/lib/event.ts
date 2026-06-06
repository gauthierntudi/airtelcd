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

export function hasGuestLastName(lastName: string | null | undefined): boolean {
  return Boolean(lastName?.trim());
}

export function guestDisplayName(
  firstName: string,
  lastName: string | null | undefined,
): string {
  return `${firstName} ${lastName?.trim() ?? ""}`.trim();
}

export function guestInitials(
  firstName: string,
  lastName: string | null | undefined,
): string {
  const first = firstName.trim().charAt(0);
  const last = lastName?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "?";
}
