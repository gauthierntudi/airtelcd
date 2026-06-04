/** QR code invitation (PNG) — email, desktop, admin. Le mobile RSVP utilise `InvitationQrCode` (SVG). */
export function invitationQrCodeImageUrl(invitationUrl: string): string {
  const data = encodeURIComponent(invitationUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&color=000000&bgcolor=ffffff&data=${data}`;
}
