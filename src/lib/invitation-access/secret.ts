export function getInvitationAccessSecret(): string {
  const secret =
    process.env.INVITATION_OTP_SECRET?.trim() ||
    process.env.ADMIN_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "INVITATION_OTP_SECRET ou ADMIN_SECRET requis pour l'accès invitation",
    );
  }
  return secret;
}
