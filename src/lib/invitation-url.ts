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

export function getAppBaseUrl(baseUrl?: string): string {
  return (
    baseUrl ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  ).replace(/\/$/, "");
}

export function invitationAbsoluteUrl(token: string, baseUrl?: string): string {
  return `${getAppBaseUrl(baseUrl)}${invitationPath(token)}`;
}
