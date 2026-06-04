import { RsvpStatus } from "@prisma/client";
import type { GuestRow } from "@/lib/guest-types";

export type GuestSortKey =
  | "name"
  | "rsvp"
  | "invitation"
  | "confirmed"
  | "created";

export type SortDir = "asc" | "desc";

const RSVP_ORDER: Record<RsvpStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  DECLINED: 2,
};

export function sortGuests(
  rows: GuestRow[],
  key: GuestSortKey,
  dir: SortDir,
): GuestRow[] {
  const mul = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "name":
        cmp = a.displayName.localeCompare(b.displayName, "fr");
        break;
      case "rsvp":
        cmp = RSVP_ORDER[a.rsvpStatus] - RSVP_ORDER[b.rsvpStatus];
        break;
      case "invitation": {
        const at = a.invitationSentAt ? new Date(a.invitationSentAt).getTime() : 0;
        const bt = b.invitationSentAt ? new Date(b.invitationSentAt).getTime() : 0;
        cmp = at - bt;
        break;
      }
      case "confirmed": {
        const at = a.confirmedAt ? new Date(a.confirmedAt).getTime() : 0;
        const bt = b.confirmedAt ? new Date(b.confirmedAt).getTime() : 0;
        cmp = at - bt;
        break;
      }
      case "created":
        cmp =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return cmp * mul;
  });
}

export const GUEST_PAGE_SIZES = [10, 20, 50] as const;
