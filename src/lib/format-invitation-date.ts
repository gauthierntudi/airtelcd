/** Format date stable serveur / client (évite les erreurs d’hydratation). */
export function formatInvitationDateTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Kinshasa",
  }).format(new Date(iso));
}
