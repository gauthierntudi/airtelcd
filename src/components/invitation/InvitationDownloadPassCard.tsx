"use client";

import type { RsvpStatus } from "@prisma/client";
import { forwardRef } from "react";
import { InvitationQrCode } from "@/components/invitation/InvitationQrCode";
import { INVITATION_RSVP_PASS_IMAGE } from "@/lib/invitation-assets";
import {
  invitationPassHeadline,
  invitationPassSubline,
} from "@/lib/invitation-pass-copy";

type Props = {
  invitationUrl: string;
  fullName: string | null;
  rsvpStatus: RsvpStatus;
};

/** Carte hors écran — reproduit le slide RSVP pour export PNG. */
export const InvitationDownloadPassCard = forwardRef<HTMLDivElement, Props>(
  function InvitationDownloadPassCard({ invitationUrl, fullName, rsvpStatus }, ref) {
    return (
      <div
        ref={ref}
        className="relative h-[780px] w-[390px] overflow-hidden bg-vodacom-black font-vodafone-lt text-white"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-pass-bg
          src={INVITATION_RSVP_PASS_IMAGE}
          alt=""
          decoding="sync"
          crossOrigin="anonymous"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="invitation-slide-overlay absolute inset-0" aria-hidden />

        <div className="relative flex h-full flex-col px-8 pb-10 pt-[5.5rem]">
          <div className="shrink-0 space-y-2">
            <h2 className="font-vodafone-exb text-[2.35rem] font-normal leading-[1.05] tracking-tight text-white">
              Votre accès Privilège
            </h2>
            <p className="font-vodafone-rg-bd text-2xl leading-snug text-vodacom-red">
              {invitationPassHeadline(fullName, rsvpStatus)}
            </p>
            <p className="font-vodafone-lt text-xl leading-snug text-white">
              {invitationPassSubline(rsvpStatus)}
            </p>
          </div>

          <div className="min-h-0 flex-1" aria-hidden />

          <div className="shrink-0 pt-3">
            <div
              className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/30"
              aria-hidden
            />
            <InvitationQrCode
              value={invitationUrl}
              variant="overlay"
              className="mx-auto w-[13.75rem]"
            />
            <p className="mt-3 text-center font-vodafone-lt text-sm leading-snug text-white/85">
              QR code — accueil de l&apos;événement
            </p>
          </div>
        </div>
      </div>
    );
  },
);
