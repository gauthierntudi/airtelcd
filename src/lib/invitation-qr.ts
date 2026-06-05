/**
 * Image PNG du QR — encode exactement `invitationUrl` (même valeur que le bouton Confirmez).
 * Le mobile RSVP utilise `InvitationQrCode` (SVG).
 */
export function invitationQrCodeImageUrl(invitationUrl: string): string {
  const data = encodeURIComponent(invitationUrl.trim());
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&color=000000&bgcolor=ffffff&data=${data}`;
}
