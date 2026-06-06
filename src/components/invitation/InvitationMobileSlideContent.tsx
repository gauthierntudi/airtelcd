"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { InvitationRsvpActionsSheet } from "@/components/invitation/InvitationRsvpActionsSheet";
import { InvitationEventDayCalendar } from "@/components/invitation/InvitationEventDayCalendar";
import { EVENT, guestSalutationPrefix } from "@/lib/event";
import { formatInvitedDaysLong } from "@/lib/event-days";
import type { EventDayId } from "@/lib/event-days";
import type { InvitationSlideId } from "@/lib/invitation-assets";
import { InvitationQrCode } from "@/components/invitation/InvitationQrCode";
import type { InvitationSharedProps } from "@/components/invitation/invitation-shared";

type SlideProps = {
  slideId: InvitationSlideId;
  displayName: string;
  guest: InvitationSharedProps["guest"];
  confirmedAt: string | null;
  loading: boolean;
  isConfirmed: boolean;
  isDeclined: boolean;
  invitationUrl: string;
  qrImageUrl: string;
  googleCalendarUrl: string;
  icsDownloadUrl: string;
  onConfirm: () => void;
};

export function InvitationMobileSlideContent(props: SlideProps) {
  switch (props.slideId) {
    case "welcome":
      return <WelcomeSlide />;
    case "invite":
      return <InviteSlide displayName={props.displayName} guest={props.guest} />;
    case "experience":
      return <ExperienceSlide />;
    case "datetime":
      return (
        <DateTimeSlide
          eventDays={props.guest.eventDays}
          timeRange={props.guest.invitationTimeRange}
        />
      );
    case "programme":
      return <ProgrammeSlide eventDays={props.guest.eventDays} />;
    case "rsvp":
      return (
        <RsvpSlide
          guest={props.guest}
          invitationUrl={props.invitationUrl}
          googleCalendarUrl={props.googleCalendarUrl}
          icsDownloadUrl={props.icsDownloadUrl}
        />
      );
    default:
      return null;
  }
}

function WelcomeSlide() {
  return (
    <div className="flex flex-col gap-3 pb-0.5">
      <div className="space-y-2">
        <p className="inline-flex max-w-full rounded-full bg-vodacom-red px-3 py-1.5 text-[11px] font-bold leading-tight text-white">
          {EVENT.title}
        </p>
        <h2 className="font-vodafone-exb font-normal text-[2.65rem] leading-[1.05] tracking-tight text-white">
          Le privilège se vit aussi sur le green
        </h2>
        <p className="font-vodafone-rg-bd font-normal text-2xl leading-snug text-vodacom-red">
          Kinshasa Open de Golf 2026
        </p>
        <p className="font-vodafone-lt font-normal text-2xl leading-snug text-white">
          Du 12 au 14 juin
        </p>
      </div>
    </div>
  );
}

function InviteSlide({
  displayName,
  guest,
}: {
  displayName: string;
  guest: InvitationSharedProps["guest"];
}) {
  return (
    <div className="flex flex-col gap-3 pb-0.5">
      <div className="space-y-2">
        <p className="inline-flex max-w-full rounded-full bg-vodacom-red px-3 py-1.5 text-[11px] font-bold leading-tight text-white">
          Invitation exclusive
        </p>
        <h2 className="font-vodafone-exb font-normal text-[2.65rem] leading-[1.05] tracking-tight text-white">
          Bonjour{guest.firstName?.trim() ? ` ${guest.firstName.trim()}` : ""}
        </h2>
        <p className="font-vodafone-rg-bd font-normal text-2xl leading-snug text-vodacom-red">
          Votre place VIP vous attend
        </p>
        <p className="font-vodafone-lt font-normal text-xl leading-snug text-white">
          Cher(e) {displayName}, nous avons le plaisir de vous convier à une journée
          exceptionnelle — sport, networking et expériences exclusives.
        </p>
      </div>
    </div>
  );
}

function ExperienceSlide() {
  return (
    <div className="flex flex-col gap-3 pb-0.5">
      <div className="space-y-2">
        <p className="inline-flex max-w-full rounded-full bg-vodacom-red px-3 py-1.5 text-[11px] font-bold leading-tight text-white">
          Expérience VIP
        </p>
        <h2 className="font-vodafone-exb font-normal text-[2.65rem] leading-[1.05] tracking-tight text-white">
          Le green bistro club
        </h2>
        <p className="font-vodafone-rg-bd font-normal text-2xl leading-snug text-vodacom-red">
          More Freedom. More Privileges.
        </p>
        <p className="font-vodafone-lt font-normal text-xl leading-snug text-white">
          Participez à des parties de golf, rencontrez d&apos;autres membres privilèges et
          profitez de surprises exclusives tout au long de la journée.
        </p>
      </div>
    </div>
  );
}

function DateTimeSlide({
  eventDays,
  timeRange,
}: {
  eventDays: EventDayId[];
  timeRange: string;
}) {
  return (
    <div className="flex flex-col gap-3 pb-0.5">
      <div className="space-y-2">
        <p className="inline-flex max-w-full rounded-full bg-white px-3 py-1.5 text-[11px] font-bold leading-tight text-vodacom-red">
          Date &amp; horaires
        </p>
        <h2 className="font-vodafone-exb font-normal text-[2.65rem] leading-[1.05] tracking-tight text-white">
          Votre rendez-vous
        </h2>
        <p className="font-vodafone-rg-bd font-normal text-2xl leading-snug text-white">
          {formatInvitedDaysLong(eventDays)}
        </p>
        <p className="font-vodafone-lt font-normal text-2xl leading-snug text-white/90">
          {timeRange}
        </p>
      </div>
    </div>
  );
}

function ProgrammeSlide({ eventDays }: { eventDays: EventDayId[] }) {
  return (
    <div className="flex flex-col gap-3 pb-0.5">
      <div className="space-y-2">
        <p className="inline-flex max-w-full rounded-full bg-vodacom-red px-3 py-1.5 text-[11px] font-bold leading-tight text-white">
          Programme
        </p>
        <h2 className="font-vodafone-exb font-normal text-[2.4rem] leading-[1.05] tracking-tight text-white">
          {eventDays.length > 1 ? "Vos journées" : "Votre journée"}
        </h2>
      </div>
      <InvitationEventDayCalendar
        invitedDayIds={eventDays}
        variant="mobile"
        openProgrammeInModal
      />
    </div>
  );
}

type RsvpSlideProps = Pick<
  SlideProps,
  "guest" | "invitationUrl" | "googleCalendarUrl" | "icsDownloadUrl"
>;

function RsvpSlide({
  guest,
  invitationUrl,
  googleCalendarUrl,
  icsDownloadUrl,
}: RsvpSlideProps) {
  const [actionsOpen, setActionsOpen] = useState(false);

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col justify-end">
        <div className="mb-4 shrink-0 space-y-2">
          <h2 className="font-vodafone-exb text-[2.35rem] font-normal leading-[1.05] tracking-tight text-white">
            Your privileged access
          </h2>
          <p className="font-vodafone-rg-bd text-2xl leading-snug text-vodacom-red">
            {guestSalutationPrefix(guest.firstName)}confirmez votre présence
          </p>
          <p className="font-vodafone-lt text-xl leading-snug text-white">
            Utilisez le bouton ci-dessous pour répondre — puis présentez votre QR code à
            l&apos;accueil.
          </p>
        </div>

        <div className="invitation-boarding-qr-sheet shrink-0 px-0 pb-0 pt-3">
          <div
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/30"
            aria-hidden
          />
          <div className="relative px-2 pb-3">
            <button
              type="button"
              onClick={() => setActionsOpen(true)}
              className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-vodacom-red shadow-sm active:bg-white/90"
              aria-label="Plus d'options"
              aria-expanded={actionsOpen}
            >
              <LucideIcon icon={Plus} size={22} strokeWidth={2.5} />
            </button>
            <InvitationQrCode
              value={invitationUrl}
              variant="overlay"
              className="mx-auto w-[min(68vw,13.75rem)]"
            />
          </div>
          <p className="px-2 pb-3 text-center font-vodafone-lt text-sm leading-snug text-white/85">
            QR code — accueil de l&apos;événement
          </p>
        </div>
      </div>

      {actionsOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <InvitationRsvpActionsSheet
            googleCalendarUrl={googleCalendarUrl}
            icsDownloadUrl={icsDownloadUrl}
            mapsUrl={EVENT.mapsUrl}
            onClose={() => setActionsOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}
