/** Retourne le chemin d'invitation si une session OTP valide existe (cookie). */
export async function fetchInvitationSessionRedirect(): Promise<string | null> {
  try {
    const res = await fetch("/api/invitation/access/session", {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { redirectPath?: string };
    return typeof data.redirectPath === "string" ? data.redirectPath : null;
  } catch {
    return null;
  }
}
