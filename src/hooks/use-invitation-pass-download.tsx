"use client";

import type { RsvpStatus } from "@prisma/client";
import { useCallback, useRef, useState } from "react";
import { InvitationDownloadPassCard } from "@/components/invitation/InvitationDownloadPassCard";
import {
  downloadInvitationPassPng,
  invitationPassFilename,
} from "@/lib/download-invitation-pass";

type Params = {
  invitationUrl: string;
  firstName: string | null;
  rsvpStatus: RsvpStatus;
};

export function useInvitationPassDownload({
  invitationUrl,
  firstName,
  rsvpStatus,
}: Params) {
  const cardRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const [downloading, setDownloading] = useState(false);

  const downloadInvitation = useCallback(async () => {
    if (!cardRef.current || busyRef.current) return;
    busyRef.current = true;
    setDownloading(true);
    try {
      await downloadInvitationPassPng(
        cardRef.current,
        invitationPassFilename(firstName),
      );
    } catch {
      /* erreur silencieuse — le toast peut être ajouté si besoin */
    } finally {
      busyRef.current = false;
      setDownloading(false);
    }
  }, [firstName]);

  const passCard = (
    <div
      aria-hidden
      className="pointer-events-none fixed left-[-10000px] top-0 -z-50 overflow-hidden"
    >
      <InvitationDownloadPassCard
        ref={cardRef}
        invitationUrl={invitationUrl}
        firstName={firstName}
        rsvpStatus={rsvpStatus}
      />
    </div>
  );

  return { downloadInvitation, downloadingInvitation: downloading, passCard };
}
