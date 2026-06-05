/** Horaire par défaut — variable {{2}} (simple) / {{3}} (nominatif) dans les emails */
export const DEFAULT_INVITATION_TIME_RANGE = "08h00 – 17h00";

export const INVITATION_TIME_RANGE_MAX_LENGTH = 80;

export function guestInvitationTimeRange(guest: {
  invitationTimeRange: string | null;
}): string {
  const trimmed = guest.invitationTimeRange?.trim();
  return trimmed || DEFAULT_INVITATION_TIME_RANGE;
}

export function parseInvitationTimeRangeInput(
  value: string | null | undefined,
): { invitationTimeRange: string } | { error: string } {
  if (value === undefined || value === null) {
    return { invitationTimeRange: DEFAULT_INVITATION_TIME_RANGE };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { invitationTimeRange: DEFAULT_INVITATION_TIME_RANGE };
  }

  if (trimmed.length > INVITATION_TIME_RANGE_MAX_LENGTH) {
    return {
      error: `Horaire trop long (max ${INVITATION_TIME_RANGE_MAX_LENGTH} caractères)`,
    };
  }

  return { invitationTimeRange: trimmed };
}
