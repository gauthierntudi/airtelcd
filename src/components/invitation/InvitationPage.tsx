"use client";

import { RsvpStatus } from "@prisma/client";
import { useEffect, useState } from "react";
import { AirtelSplashLoader } from "@/components/home/AirtelSplashLoader";
import {
  InvitationRsvpNameSheet,
  type RsvpNamePayload,
} from "@/components/invitation/InvitationRsvpNameSheet";
import { InvitationView } from "@/components/invitation/InvitationView";
import type { InvitationSharedProps } from "@/components/invitation/invitation-shared";
import { guestInvitationDisplayName, hasGuestFullName } from "@/lib/event";
import type { InvitationGuestView } from "@/lib/load-invitation-guest";
import { useInvitationPassDownload } from "@/hooks/use-invitation-pass-download";
import { notify } from "@/lib/toast";
import { clearAirtelSplashSkip } from "@/lib/airtel-splash";
import { publicPath } from "@/lib/branding";

type Props = {
  guest: InvitationGuestView;
  invitationUrl: string;
  qrImageUrl: string;
  googleCalendarUrl: string;
  icsDownloadUrl: string;
  /** True si on arrive du login : ne pas rejouer le splash. */
  skipSplash?: boolean;
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
  skipSplash = false,
}: Props) {
  const [guest, setGuest] = useState(initialGuest);
  const displayName = guestInvitationDisplayName(guest.fullName);
  const [status, setStatus] = useState(guest.rsvpStatus);
  const [confirmedAt, setConfirmedAt] = useState(guest.confirmedAt);
  const [loading, setLoading] = useState(false);
  const [nameSheetOpen, setNameSheetOpen] = useState(false);
  const [splash, setSplash] = useState(!skipSplash);

  useEffect(() => {
    clearAirtelSplashSkip();
    if (skipSplash) return;
    const id = window.setTimeout(() => setSplash(false), 1400);
    return () => window.clearTimeout(id);
  }, [skipSplash]);
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
        fetch(publicPath("/api/rsvp"), {
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

  return (
    <>
      {passCard}
      {splash && <AirtelSplashLoader />}
      <InvitationView {...shared} />
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
