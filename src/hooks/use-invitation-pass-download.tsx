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
  fullName: string | null;
  rsvpStatus: RsvpStatus;
};

export function useInvitationPassDownload({
  invitationUrl,
  fullName,
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
        invitationPassFilename(fullName),
      );
    } catch {
      /* erreur silencieuse */
    } finally {
      busyRef.current = false;
      setDownloading(false);
    }
  }, [fullName]);

  const passCard = (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 -z-50 overflow-hidden opacity-0"
      style={{ width: 390, height: 780 }}
    >
      <InvitationDownloadPassCard
        ref={cardRef}
        invitationUrl={invitationUrl}
        fullName={fullName}
        rsvpStatus={rsvpStatus}
      />
    </div>
  );

  return { downloadInvitation, downloadingInvitation: downloading, passCard };
}
