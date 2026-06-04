import type { Metadata } from "next";
import { InvitationPage } from "@/components/invitation/InvitationPage";
import { EVENT } from "@/lib/event";
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
    select: { firstName: true, lastName: true },
  });
  if (!guest) return { title: "Invitation" };
  return {
    title: `${guest.firstName} ${guest.lastName} — ${EVENT.title}`,
    description: `Confirmez votre présence à ${EVENT.title}.`,
  };
}

export default async function ConfirmInvitationPage({ params }: Props) {
  const { ref } = await params;
  const token = parseTokenFromConfirmRef(ref);
  if (!token) notFound();

  const guest = await loadInvitationGuestByToken(token);
  const invitationUrl = invitationAbsoluteUrl(token);
  return (
    <InvitationPage
      guest={guest}
      invitationUrl={invitationUrl}
      qrImageUrl={invitationQrCodeImageUrl(invitationUrl)}
      googleCalendarUrl={buildGoogleCalendarUrl(invitationUrl, guest.eventDays)}
      icsDownloadUrl={buildIcsDownloadUrl(invitationUrl, guest.eventDays)}
    />
  );
}
