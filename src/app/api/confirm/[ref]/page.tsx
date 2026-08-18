import type { Metadata } from "next";
import { cookies } from "next/headers";
import { InvitationPage } from "@/components/invitation/InvitationPage";
import { EVENT, guestInvitationDisplayName } from "@/lib/event";
import { AIRTEL_SKIP_SPLASH_COOKIE } from "@/lib/airtel-splash";
import {
  buildGoogleCalendarUrl,
  buildIcsDownloadUrl,
} from "@/lib/invitation-calendar";
import { invitationQrCodeImageUrl } from "@/lib/invitation-qr";
import { invitationAbsoluteUrl, parseTokenFromConfirmRef } from "@/lib/invitation-url";
import { loadInvitationGuestByToken } from "@/lib/load-invitation-guest";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ ref: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ref } = await params;
  const token = parseTokenFromConfirmRef(ref);
  if (!token) return { title: "Invitation" };
  const guest = await prisma.guest.findUnique({
    where: { token },
    select: { fullName: true, event: { select: { name: true } } },
  });
  if (!guest) return { title: "Invitation" };
  const name = guestInvitationDisplayName(guest.fullName);
  const eventName = guest.event?.name ?? EVENT.title;
  return {
    title: name ? `${name} — ${eventName}` : `Votre invitation — ${eventName}`,
    description: `Confirmez votre présence à ${eventName}.`,
  };
}

export default async function ConfirmInvitationPage({ params }: Props) {
  const { ref } = await params;
  const token = parseTokenFromConfirmRef(ref);
  if (!token) notFound();

  const guest = await loadInvitationGuestByToken(token);
  const invitationUrl = invitationAbsoluteUrl(token);
  const skipSplash =
    (await cookies()).get(AIRTEL_SKIP_SPLASH_COOKIE)?.value === "1";
  return (
    <InvitationPage
      guest={guest}
      skipSplash={skipSplash}
      invitationUrl={invitationUrl}
      qrImageUrl={invitationQrCodeImageUrl(invitationUrl)}
      googleCalendarUrl={buildGoogleCalendarUrl({
        invitationUrl,
        eventName: guest.event.name,
        venue: guest.event.venue,
        eventDays: guest.eventDays,
        dayTimes: guest.event.dayTimes,
        fallbackRange: guest.event.timeRange,
      })}
      icsDownloadUrl={buildIcsDownloadUrl({
        invitationUrl,
        eventName: guest.event.name,
        venue: guest.event.venue,
        eventDays: guest.eventDays,
        dayTimes: guest.event.dayTimes,
        fallbackRange: guest.event.timeRange,
      })}
    />
  );
}
