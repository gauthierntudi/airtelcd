import { publicPath } from "@/lib/branding";

type InvitationSessionPayload = {
  redirectPath?: string;
  authenticated?: boolean;
};

/** Retourne le chemin d'invitation si une session valide existe (cookie). */
export async function fetchInvitationSessionRedirect(): Promise<string | null> {
  const data = await fetchInvitationSession();
  if (!data || data.authenticated === false) return null;
  return typeof data.redirectPath === "string" ? data.redirectPath : null;
}

export async function fetchInvitationSession(): Promise<InvitationSessionPayload | null> {
  try {
    const res = await fetch(publicPath("/api/invitation/access/session"), {
      credentials: "include",
    });
    if (!res.ok) return null;
    return (await res.json()) as InvitationSessionPayload;
  } catch {
    return null;
  }
}

export async function isInvitationSessionAuthenticated(): Promise<boolean> {
  const data = await fetchInvitationSession();
  return Boolean(data && data.authenticated !== false && data.redirectPath);
}

/** Supprime la session serveur (cookie `invitation_access`). */
export async function destroyInvitationSession(): Promise<void> {
  try {
    await fetch(publicPath("/api/invitation/access/session"), {
      method: "DELETE",
      credentials: "include",
    });
  } catch {
    /* ignore */
  }
}
