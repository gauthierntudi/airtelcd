import { invitationPath } from "@/lib/invitation-url";
import { parseInvitationSessionValue } from "@/lib/invitation-access/session";
import { prisma } from "@/lib/prisma";

export async function resolveInvitationSessionRedirect(
  sessionCookieValue: string | undefined,
): Promise<{ redirectPath: string } | null> {
  const parsed = parseInvitationSessionValue(sessionCookieValue);
  if (!parsed) return null;

  const guest = await prisma.guest.findUnique({
    where: { id: parsed.guestId },
    select: { token: true },
  });
  if (!guest) return null;

  return { redirectPath: invitationPath(guest.token) };
}
