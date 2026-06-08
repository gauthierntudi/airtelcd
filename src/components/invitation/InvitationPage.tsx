"use client";

import { RsvpStatus } from "@prisma/client";
import { useState } from "react";
import { InvitationDesktopView } from "@/components/invitation/InvitationDesktopView";
import { InvitationMobileOnboarding } from "@/components/invitation/InvitationMobileOnboarding";
import {
  InvitationRsvpNameSheet,
  type RsvpNamePayload,
} from "@/components/invitation/InvitationRsvpNameSheet";
import { WelcomeHashtagLoader } from "@/components/invitation/WelcomeHashtagLoader";
import type { InvitationSharedProps } from "@/components/invitation/invitation-shared";
import { useIsLgViewport } from "@/hooks/use-is-lg-viewport";
import { guestInvitationDisplayName, hasGuestFullName } from "@/lib/event";
import type { InvitationGuestView } from "@/lib/load-invitation-guest";
import { useInvitationPassDownload } from "@/hooks/use-invitation-pass-download";
import { notify } from "@/lib/toast";

type Props = {
  guest: InvitationGuestView;
  invitationUrl: string;
  qrImageUrl: string;
  googleCalendarUrl: string;
  icsDownloadUrl: string;
};

type RsvpResponse = {
  rsvpStatus: RsvpStatus;
  confirmedAt: string | null;
  fullName: string | null;
  displayName: string;
};

export function InvitationPage({
  guest: initialGuest,
  invitationUrl,
  qrImageUrl,
  googleCalendarUrl,
  icsDownloadUrl,
}: Props) {
  const [guest, setGuest] = useState(initialGuest);
  const displayName = guestInvitationDisplayName(guest.fullName);
  const [status, setStatus] = useState(guest.rsvpStatus);
  const [confirmedAt, setConfirmedAt] = useState(guest.confirmedAt);
  const [loading, setLoading] = useState(false);
  const [nameSheetOpen, setNameSheetOpen] = useState(false);
  const [welcomeLoaderDone, setWelcomeLoaderDone] = useState(false);
  const isLg = useIsLgViewport();
  const { downloadInvitation, downloadingInvitation, passCard } =
    useInvitationPassDownload({
      invitationUrl,
      fullName: guest.fullName,
      rsvpStatus: status,
    });

  async function updateRsvp(next: RsvpStatus, names?: RsvpNamePayload) {
    setLoading(true);
    const successMessage =
      next === RsvpStatus.CONFIRMED ? "Présence confirmée" : "Réponse enregistrée";

    try {
      const data = await notify.promise(
        fetch("/api/rsvp", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: guest.token,
            status: next,
            ...(names?.fullName ? { fullName: names.fullName } : {}),
          }),
        }).then(async (res) => {
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Erreur");
          return json as RsvpResponse;
        }),
        {
          pending: "En cours…",
          success: successMessage,
          error: "Erreur",
        },
        { type: next === RsvpStatus.CONFIRMED ? "success" : "info" },
      );
      setStatus(data.rsvpStatus);
      setConfirmedAt(data.confirmedAt);
      setGuest((prev) => ({
        ...prev,
        fullName: data.fullName,
      }));
      setNameSheetOpen(false);
    } catch {
      /* toast erreur déjà affiché */
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!hasGuestFullName(guest.fullName)) {
      setNameSheetOpen(true);
      return;
    }
    void updateRsvp(RsvpStatus.CONFIRMED);
  }

  const shared: InvitationSharedProps = {
    guest,
    displayName,
    status,
    confirmedAt,
    loading,
    invitationUrl,
    qrImageUrl,
    googleCalendarUrl,
    icsDownloadUrl,
    onDownloadInvitation: downloadInvitation,
    downloadingInvitation,
    onConfirm: handleConfirm,
    onDecline: () => updateRsvp(RsvpStatus.DECLINED),
  };

  const welcomeLoader = !welcomeLoaderDone && (
    <WelcomeHashtagLoader onDone={() => setWelcomeLoaderDone(true)} />
  );

  if (isLg === null) {
    return (
      <>
        {welcomeLoader}
        <div className="min-h-screen bg-vodacom-cream" aria-busy="true" />
      </>
    );
  }

  return (
    <>
      {passCard}
      {welcomeLoader}
      {isLg ? (
        <InvitationDesktopView {...shared} />
      ) : (
        <InvitationMobileOnboarding {...shared} />
      )}
      {nameSheetOpen && (
        <InvitationRsvpNameSheet
          loading={loading}
          onClose={() => setNameSheetOpen(false)}
          onSubmit={(names) => updateRsvp(RsvpStatus.CONFIRMED, names)}
        />
      )}
    </>
  );
}
