export type InvitationAccessChannel = "email" | "sms";

/** Destination après OTP réussi — selon l'expérience demandée. */
export type InvitationAccessPostAuth = "invitation" | "market" | "mpesa";

export const INVITATION_ACCESS_GENERIC_SENT =
  "Si vos coordonnées correspondent à une invitation, vous recevrez un code de confirmation.";

export const INVITATION_ACCESS_SMS_NOT_FOUND = "Numéro incorrect";

export const INVITATION_ACCESS_EMAIL_NOT_FOUND = "E-mail incorrect";
