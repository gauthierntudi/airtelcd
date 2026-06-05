const ACTION_PREFIX = "action=";

/** Chemin public d’invitation : /api/confirm/action=aBcD1234 */
export function invitationPath(token: string): string {
  return `/api/confirm/${ACTION_PREFIX}${token}`;
}

/** Extrait le token depuis le segment d’URL (ex. `action=aBcD1234`). */
export function parseTokenFromConfirmRef(ref: string): string | null {
  const decoded = decodeURIComponent(ref.trim());
  if (!decoded.startsWith(ACTION_PREFIX)) return null;
  const token = decoded.slice(ACTION_PREFIX.length).trim();
  return token.length > 0 ? token : null;
}

/** URL publique de l'app (check-in, OTP, etc.). */
export function getAppBaseUrl(fallback?: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  return (
    fallback ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  ).replace(/\/$/, "");
}

/**
 * Origine des liens de confirmation invité.
 * Lien final : `{URL_ORIGIN_CONFIRM}/api/confirm/action={token}`
 * (équivalent template WhatsApp : `…/action={{2}}`).
 */
export function getConfirmOrigin(fallback?: string): string {
  const configured = process.env.URL_ORIGIN_CONFIRM?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return getAppBaseUrl(fallback);
}

export function invitationAbsoluteUrl(token: string, baseUrl?: string): string {
  return `${getConfirmOrigin(baseUrl)}${invitationPath(token)}`;
}
