"use client";

import { RsvpStatus } from "@prisma/client";
import { useState } from "react";
import { InvitationDesktopView } from "@/components/invitation/InvitationDesktopView";
import { InvitationMobileOnboarding } from "@/components/invitation/InvitationMobileOnboarding";
import { WelcomeHashtagLoader } from "@/components/invitation/WelcomeHashtagLoader";
import type { InvitationSharedProps } from "@/components/invitation/invitation-shared";
import { useIsLgViewport } from "@/hooks/use-is-lg-viewport";
import type { InvitationGuestView } from "@/lib/load-invitation-guest";
import { notify } from "@/lib/toast";

type Props = {
  guest: InvitationGuestView;
  invitationUrl: string;
  qrImageUrl: string;
  googleCalendarUrl: string;
  icsDownloadUrl: string;
};

export function InvitationPage({
  guest,
  invitationUrl,
  qrImageUrl,
  googleCalendarUrl,
  icsDownloadUrl,
}: Props) {
  const displayName = `${guest.firstName} ${guest.lastName}`.trim();
  const [status, setStatus] = useState(guest.rsvpStatus);
  const [confirmedAt, setConfirmedAt] = useState(guest.confirmedAt);
  const [loading, setLoading] = useState(false);
  const [welcomeLoaderDone, setWelcomeLoaderDone] = useState(false);
  const isLg = useIsLgViewport();

  async function updateRsvp(next: RsvpStatus) {
    setLoading(true);
    const successMessage =
      next === RsvpStatus.CONFIRMED ? "Présence confirmée" : "Réponse enregistrée";

    try {
      const data = await notify.promise(
        fetch("/api/rsvp", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: guest.token, status: next }),
        }).then(async (res) => {
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Erreur");
          return json as { rsvpStatus: RsvpStatus; confirmedAt: string | null };
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
    } catch {
      /* toast erreur déjà affiché */
    } finally {
      setLoading(false);
    }
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
    onConfirm: () => updateRsvp(RsvpStatus.CONFIRMED),
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
      {welcomeLoader}
      {isLg ? (
        <InvitationDesktopView {...shared} />
      ) : (
        <InvitationMobileOnboarding {...shared} />
      )}
    </>
  );
}
