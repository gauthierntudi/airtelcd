import { clearExperienceProfile } from "@/lib/experience-profile";
import { destroyInvitationSession } from "@/lib/invitation-access/client-session";
import { invalidateMpesaVisaCache } from "@/lib/mpesa-visa/client";

/** Fin d'expérience : cookie httpOnly, cache M-Pesa et profil local. */
export async function endExperienceSession(): Promise<void> {
  invalidateMpesaVisaCache();
  clearExperienceProfile();
  await destroyInvitationSession();
}
