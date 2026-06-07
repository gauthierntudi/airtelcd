import { CheckinKioskStatus, RsvpStatus } from "@prisma/client";
import { randomBytes } from "crypto";
import {
  CHECKIN_SESSION_STALE_MS,
  CHECKIN_SUCCESS_COUNTDOWN_SEC,
} from "@/lib/checkin/constants";
import { checkinScanAbsoluteUrl } from "@/lib/checkin/urls";
import {
  requestInvitationAccessOtp,
  verifyInvitationAccessOtp,
} from "@/lib/invitation-access/service";
import type { InvitationAccessChannel } from "@/lib/invitation-access/types";
import { guestDisplayName } from "@/lib/event";
import { prisma } from "@/lib/prisma";

export type CheckinKioskView = {
  token: string;
  status: CheckinKioskStatus;
  qrUrl: string;
  displayName: string | null;
  countdownSeconds: number | null;
  headline: string;
  subline: string | null;
};

export type CheckinGuestView = {
  token: string;
  status: CheckinKioskStatus;
  displayName: string | null;
  rsvpStatus: RsvpStatus | null;
  needsRsvpConfirm: boolean;
  checkedIn: boolean;
  countdownSeconds: number | null;
  headline: string;
  subline: string | null;
};

function newKioskToken(): string {
  return randomBytes(18).toString("base64url");
}

function countdownRemaining(successEndsAt: Date | null): number | null {
  if (!successEndsAt) return null;
  const sec = Math.ceil((successEndsAt.getTime() - Date.now()) / 1000);
  return sec > 0 ? sec : 0;
}

function kioskHeadlines(
  status: CheckinKioskStatus,
  displayName: string | null,
): { headline: string; subline: string | null } {
  switch (status) {
    case CheckinKioskStatus.SHOW_QR:
      return {
        headline: "Scannez ce QR code",
        subline: "pour vérifier votre invitation",
      };
    case CheckinKioskStatus.WAITING_GUEST:
      return {
        headline: "En attente de confirmation",
        subline: "Complétez la vérification sur votre téléphone",
      };
    case CheckinKioskStatus.WAITING_CONFIRM:
      return {
        headline: "Veuillez confirmer votre invitation",
        subline: displayName ? `${displayName} — sur votre téléphone` : null,
      };
    case CheckinKioskStatus.SUCCESS:
      return {
        headline: displayName ? `Bienvenue, ${displayName} !` : "Check-in réussi",
        subline: "Profitez de l'événement Vodacom Privilège Golf",
      };
    default:
      return { headline: "Check-in", subline: null };
  }
}

function guestHeadlines(
  status: CheckinKioskStatus,
  displayName: string | null,
  rsvpStatus: RsvpStatus | null,
): { headline: string; subline: string | null } {
  switch (status) {
    case CheckinKioskStatus.WAITING_GUEST:
      return {
        headline: "Vérification invitation",
        subline: "Saisissez votre e-mail ou numéro de téléphone",
      };
    case CheckinKioskStatus.WAITING_CONFIRM:
      return {
        headline: displayName ? `Bonjour ${displayName}` : "Confirmez votre présence",
        subline: "Une dernière étape pour valider votre check-in",
      };
    case CheckinKioskStatus.SUCCESS:
      if (rsvpStatus === RsvpStatus.CONFIRMED) {
        return {
          headline: "Check-in validé",
          subline: displayName
            ? `Merci ${displayName}, à tout de suite sur le parcours !`
            : "Merci, à tout de suite sur le parcours !",
        };
      }
      return {
        headline: "Présence confirmée",
        subline: "Votre check-in est enregistré",
      };
    default:
      return { headline: "Check-in", subline: null };
  }
}

function mapKioskView(
  session: {
    token: string;
    status: CheckinKioskStatus;
    displayName: string | null;
    successEndsAt: Date | null;
  },
  baseUrl?: string,
): CheckinKioskView {
  const { headline, subline } = kioskHeadlines(
    session.status,
    session.displayName,
  );
  return {
    token: session.token,
    status: session.status,
    qrUrl: checkinScanAbsoluteUrl(session.token, baseUrl),
    displayName: session.displayName,
    countdownSeconds: countdownRemaining(session.successEndsAt),
    headline,
    subline,
  };
}

function mapGuestView(
  session: {
    token: string;
    status: CheckinKioskStatus;
    displayName: string | null;
    successEndsAt: Date | null;
    guest: {
      rsvpStatus: RsvpStatus;
      checkedInAt: Date | null;
    } | null;
  },
): CheckinGuestView {
  const rsvpStatus = session.guest?.rsvpStatus ?? null;
  const { headline, subline } = guestHeadlines(
    session.status,
    session.displayName,
    rsvpStatus,
  );
  return {
    token: session.token,
    status: session.status,
    displayName: session.displayName,
    rsvpStatus,
    needsRsvpConfirm: session.status === CheckinKioskStatus.WAITING_CONFIRM,
    checkedIn: Boolean(session.guest?.checkedInAt),
    countdownSeconds: countdownRemaining(session.successEndsAt),
    headline,
    subline,
  };
}

async function createKioskSession() {
  return prisma.checkinKioskSession.create({
    data: { token: newKioskToken() },
  });
}

function isSessionStale(updatedAt: Date, status: CheckinKioskStatus): boolean {
  if (status === CheckinKioskStatus.SHOW_QR) return false;
  if (status === CheckinKioskStatus.SUCCESS) return false;
  return Date.now() - updatedAt.getTime() > CHECKIN_SESSION_STALE_MS;
}

function shouldRotateSession(session: {
  status: CheckinKioskStatus;
  successEndsAt: Date | null;
  updatedAt: Date;
}): boolean {
  if (
    session.status === CheckinKioskStatus.SUCCESS &&
    session.successEndsAt &&
    session.successEndsAt.getTime() <= Date.now()
  ) {
    return true;
  }
  return isSessionStale(session.updatedAt, session.status);
}

async function getSessionByToken(token: string) {
  return prisma.checkinKioskSession.findUnique({
    where: { token },
    include: {
      guest: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rsvpStatus: true,
          checkedInAt: true,
        },
      },
    },
  });
}

async function getActiveKioskSession() {
  const latest = await prisma.checkinKioskSession.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      guest: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rsvpStatus: true,
          checkedInAt: true,
        },
      },
    },
  });

  if (!latest || shouldRotateSession(latest)) {
    return createKioskSession();
  }

  return latest;
}

async function markCheckinSuccess(
  sessionId: string,
  guest: { id: string; firstName: string | null; lastName: string | null },
  confirmRsvp: boolean,
) {
  const successEndsAt = new Date(
    Date.now() + CHECKIN_SUCCESS_COUNTDOWN_SEC * 1000,
  );
  const displayName = guestDisplayName(guest.firstName, guest.lastName);

  await prisma.$transaction([
    prisma.guest.update({
      where: { id: guest.id },
      data: {
        checkedInAt: new Date(),
        ...(confirmRsvp
          ? {
              rsvpStatus: RsvpStatus.CONFIRMED,
              confirmedAt: new Date(),
            }
          : {}),
      },
    }),
    prisma.checkinKioskSession.update({
      where: { id: sessionId },
      data: {
        status: CheckinKioskStatus.SUCCESS,
        guestId: guest.id,
        displayName,
        successEndsAt,
      },
    }),
  ]);
}

export async function getKioskDisplayState(
  baseUrl?: string,
): Promise<CheckinKioskView> {
  const session = await getActiveKioskSession();
  return mapKioskView(session, baseUrl);
}

export async function getKioskGuestState(
  token: string,
): Promise<CheckinGuestView | null> {
  const session = await getSessionByToken(token);
  if (!session) return null;
  return mapGuestView(session);
}

export async function markKioskScanned(token: string) {
  const session = await getSessionByToken(token);
  if (!session) {
    throw new Error("Session de check-in introuvable.");
  }

  if (session.status === CheckinKioskStatus.SUCCESS) {
    throw new Error("Cette session est terminée. Scannez le QR affiché à l'accueil.");
  }

  if (isSessionStale(session.updatedAt, session.status)) {
    throw new Error("Session expirée. Scannez le QR code affiché à l'accueil.");
  }

  if (session.status !== CheckinKioskStatus.SHOW_QR) {
    return mapGuestView(session);
  }

  const updated = await prisma.checkinKioskSession.update({
    where: { id: session.id },
    data: {
      status: CheckinKioskStatus.WAITING_GUEST,
      scannedAt: new Date(),
    },
    include: {
      guest: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rsvpStatus: true,
          checkedInAt: true,
        },
      },
    },
  });

  return mapGuestView(updated);
}

export async function requestCheckinOtp(
  token: string,
  channel: InvitationAccessChannel,
  contact: string,
) {
  const session = await getSessionByToken(token);
  if (!session) throw new Error("Session introuvable.");
  if (
    session.status !== CheckinKioskStatus.WAITING_GUEST &&
    session.status !== CheckinKioskStatus.WAITING_CONFIRM
  ) {
    throw new Error("Cette étape n'est plus disponible.");
  }

  return requestInvitationAccessOtp({ channel, contact });
}

export async function verifyCheckinOtp(
  token: string,
  channel: InvitationAccessChannel,
  contact: string,
  code: string,
): Promise<CheckinGuestView> {
  const session = await getSessionByToken(token);
  if (!session) throw new Error("Session introuvable.");

  if (
    session.status !== CheckinKioskStatus.WAITING_GUEST &&
    session.status !== CheckinKioskStatus.WAITING_CONFIRM
  ) {
    throw new Error("Cette étape n'est plus disponible.");
  }

  const { guestId } = await verifyInvitationAccessOtp({
    channel,
    contact,
    code,
  });

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      rsvpStatus: true,
      checkedInAt: true,
    },
  });

  if (!guest) throw new Error("Invité introuvable.");

  if (guest.rsvpStatus === RsvpStatus.DECLINED) {
    throw new Error(
      "Votre invitation a été déclinée. Contactez l'organisateur.",
    );
  }

  if (guest.rsvpStatus === RsvpStatus.CONFIRMED) {
    await markCheckinSuccess(session.id, guest, false);
  } else {
    await prisma.checkinKioskSession.update({
      where: { id: session.id },
      data: {
        status: CheckinKioskStatus.WAITING_CONFIRM,
        guestId: guest.id,
        displayName: guestDisplayName(guest.firstName, guest.lastName),
      },
    });
  }

  const refreshed = await getSessionByToken(token);
  if (!refreshed) throw new Error("Session introuvable.");
  return mapGuestView(refreshed);
}

export async function confirmCheckinRsvp(
  token: string,
): Promise<CheckinGuestView> {
  const session = await getSessionByToken(token);
  if (!session) throw new Error("Session introuvable.");

  if (session.status !== CheckinKioskStatus.WAITING_CONFIRM || !session.guest) {
    throw new Error("Confirmation non requise pour cette session.");
  }

  if (session.guest.rsvpStatus === RsvpStatus.DECLINED) {
    throw new Error("Invitation déclinée.");
  }

  await markCheckinSuccess(session.id, session.guest, true);

  const refreshed = await getSessionByToken(token);
  if (!refreshed) throw new Error("Session introuvable.");
  return mapGuestView(refreshed);
}
