"use client";

import { RsvpStatus } from "@prisma/client";
import {
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Download,
  Headphones,
  Loader2,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Shield,
  Shirt,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { invitationRsvpSlideHeadline } from "@/lib/invitation-pass-copy";
import {
  INVITATION_RSVP_UI,
  type InvitationSharedProps,
} from "@/components/invitation/invitation-shared";
import { InvitationEventDayCalendar } from "@/components/invitation/InvitationEventDayCalendar";
import { InvitationQrCode } from "@/components/invitation/InvitationQrCode";
import { EVENT } from "@/lib/event";
import { formatInvitedDaysLong } from "@/lib/event-days";
import { INVITATION_CLIENT_IMAGES } from "@/lib/invitation-assets";
import { formatInvitationDateTime } from "@/lib/format-invitation-date";
import type { InvitationGuestView } from "@/lib/load-invitation-guest";

export function InvitationDesktopView({
  guest,
  displayName,
  status,
  confirmedAt,
  loading,
  invitationUrl,
  googleCalendarUrl,
  onDownloadInvitation,
  downloadingInvitation,
  onConfirm,
  onDecline,
}: InvitationSharedProps) {
  const rsvpBadge = INVITATION_RSVP_UI[status];
  const isConfirmed = status === RsvpStatus.CONFIRMED;
  const isDeclined = status === RsvpStatus.DECLINED;

  return (
    <div className="min-h-screen bg-vodacom-cream font-vodafone-lt text-vodacom-black">
      <section className="relative w-full bg-vodacom-black">
        <div className="relative w-full">
          <InvitePhoto
            src={INVITATION_CLIENT_IMAGES.hero.src}
            alt={INVITATION_CLIENT_IMAGES.hero.alt}
            priority
            className="aspect-[21/9] h-auto max-h-[min(52vh,520px)] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-vodacom-black via-vodacom-black/55 to-vodacom-black/15" />

          <div className="absolute inset-x-0 top-0 z-10 px-8 pt-4">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
              <VodacomLogo variant="white" height={40} priority />
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ring-1 ring-inset ${rsvpBadge.className}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${rsvpBadge.dot}`} />
                {rsvpBadge.label}
              </span>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 px-8 pb-10 pt-20">
            <div className="mx-auto max-w-6xl">
              <p className="inline-flex rounded-full bg-vodacom-red px-3 py-1.5 text-[11px] font-bold text-white">
                {EVENT.title}
              </p>
              <h1 className="mt-3 font-vodafone-exb text-4xl font-normal leading-tight tracking-tight text-white">
                Le privilège se vit aussi sur le green
              </h1>
              <p className="mt-2 font-vodafone-lt text-lg leading-relaxed text-white/90">
                {displayName ? (
                  <>
                    Cher(e){" "}
                    <span className="font-vodafone-rg-bd text-white">{displayName}</span>
                    , votre invitation exclusive vous attend.
                  </>
                ) : (
                  <>Votre invitation exclusive vous attend.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-8 py-10">
        <div className="grid grid-cols-12 items-start gap-8">
          <div className="col-span-7 space-y-6">
            <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-vodacom-silver/25">
              <div className="relative">
                <InvitePhoto
                  src={INVITATION_CLIENT_IMAGES.experience.src}
                  alt={INVITATION_CLIENT_IMAGES.experience.alt}
                  className="h-56 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-vodacom-black/75 via-vodacom-black/30 to-transparent" />
                <div className="absolute bottom-4 left-5 right-4">
                  <p className="inline-flex rounded-full bg-vodacom-red px-3 py-1 text-[11px] font-bold text-white">
                    Expérience Privilège
                  </p>
                  <p className="mt-2 font-vodafone-exb text-2xl leading-tight text-white">
                    Le green bistro club
                  </p>
                  <p className="font-vodafone-rg-bd text-lg text-vodacom-red">
                    Plus de flexibilité, plus de privilèges
                  </p>
                </div>
              </div>
              <div className="space-y-4 p-6">
                <p className="font-vodafone-lt text-base leading-relaxed text-vodacom-black/85">
                  Participez à des parties de golf, rencontrez d&apos;autres membres privilèges et
                  profitez de surprises exclusives tout au long de la journée.
                </p>
                <ul className="grid grid-cols-3 gap-3">
                  <InfoChip
                    icon={Calendar}
                    label="Votre date"
                    value={formatInvitedDaysLong(guest.eventDays)}
                    sub={guest.invitationTimeRange}
                  />
                  <InfoChip icon={MapPin} label="Lieu" value={EVENT.venue} />
                  <InfoChip icon={Shirt} label="Tenue" value={EVENT.dressCode} />
                </ul>
              </div>
            </article>

            <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-vodacom-silver/25">
              <div className="relative border-b border-vodacom-silver/20">
                <InvitePhoto
                  src={INVITATION_CLIENT_IMAGES.programme.src}
                  alt={INVITATION_CLIENT_IMAGES.programme.alt}
                  className="h-36 w-full object-cover"
                />
                <div className="absolute inset-0 bg-vodacom-red/70 mix-blend-multiply" />
                <div className="absolute inset-0 flex items-end p-5">
                  <h2 className="flex items-center gap-2 font-vodafone-exb text-xl font-normal text-white">
                    <LucideIcon icon={Clock} size={22} />
                    Programme
                  </h2>
                </div>
              </div>
              <div className="space-y-4 px-6 py-5">
                <InvitationEventDayCalendar
                  invitedDayIds={guest.eventDays}
                  variant="desktop"
                  showAgenda
                />
              </div>
            </article>

            <ContactSection />
          </div>

          <aside className="col-span-5 col-start-8 space-y-4 lg:sticky lg:top-6">
            <RsvpPanel
              guest={guest}
              loading={loading}
              isConfirmed={isConfirmed}
              isDeclined={isDeclined}
              confirmedAt={confirmedAt}
              onConfirm={onConfirm}
              onDecline={onDecline}
            />

            <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-vodacom-silver/25">
              <h3 className="font-vodafone-exb text-lg font-normal text-vodacom-black">
                Vous pouvez aussi :
              </h3>
              <ul className="mt-3 space-y-2">
                <DesktopActionLink
                  href={googleCalendarUrl}
                  external
                  icon={CalendarPlus}
                  label="Ajouter au calendrier"
                />
                <DesktopActionLink
                  href={EVENT.mapsUrl}
                  external
                  icon={Navigation}
                  label="Itinéraire"
                />
                <DesktopActionButton
                  icon={Download}
                  label={
                    downloadingInvitation
                      ? "Préparation…"
                      : "Télécharger l'invitation"
                  }
                  disabled={downloadingInvitation}
                  onClick={() => void onDownloadInvitation()}
                />
              </ul>
            </section>

            <section className="flex items-center gap-4 rounded-2xl bg-vodacom-black p-4 shadow-sm">
              <InvitationQrCode
                value={invitationUrl}
                variant="desktop"
                className="shrink-0 rounded-lg bg-white p-2"
              />
              <div>
                <p className="font-vodafone-rg-bd text-sm text-white">QR code</p>
                <p className="mt-1 font-vodafone-lt text-xs leading-snug text-white/70">
                  Présentez-le à l&apos;accueil ou ouvrez l&apos;invitation sur un autre appareil.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function InvitePhoto({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={800}
      unoptimized
      priority={priority}
      className={`block ${className}`}
    />
  );
}

function RsvpPanel({
  guest,
  loading,
  isConfirmed,
  isDeclined,
  confirmedAt,
  onConfirm,
  onDecline,
}: {
  guest: InvitationGuestView;
  loading: boolean;
  isConfirmed: boolean;
  isDeclined: boolean;
  confirmedAt: string | null;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  return (
    <section
      id="rsvp"
      className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-vodacom-silver/30"
    >
      <div className="bg-vodacom-red px-5 py-4">
        <h2 className="font-vodafone-exb text-2xl font-normal leading-tight text-white">
          Votre accès Privilège
        </h2>
        <p className="mt-1 font-vodafone-rg-bd text-base text-white/95">
          {invitationRsvpSlideHeadline(
            guest.fullName,
            isConfirmed ? RsvpStatus.CONFIRMED : RsvpStatus.PENDING,
          )}
        </p>
      </div>
      <div className="p-5">
        {isConfirmed ? (
          <div className="space-y-3 text-center">
            <LucideIcon icon={CheckCircle2} size={40} className="mx-auto text-emerald-600" />
            <p className="font-vodafone-rg-bd text-emerald-800">
              À bientôt sur le green
              {guest.fullName?.trim() ? `, ${guest.fullName.trim()}` : ""} !
            </p>
            {confirmedAt && (
              <p
                className="font-vodafone-lt text-xs text-vodacom-black/50"
                suppressHydrationWarning
              >
                {formatInvitationDateTime(confirmedAt)}
              </p>
            )}
          </div>
        ) : isDeclined ? (
          <div className="space-y-3 text-center">
            <LucideIcon icon={XCircle} size={36} className="mx-auto text-neutral-400" />
            <p className="font-vodafone-lt text-sm text-vodacom-black/75">
              Participation déclinée.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="w-full rounded-xl bg-vodacom-red py-3.5 font-vodafone-rg-bd text-sm font-normal text-white disabled:opacity-50"
            >
              Finalement, je confirme
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-center font-vodafone-lt text-sm text-vodacom-black/70">
              Utilisez les boutons ci-dessous pour répondre.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-vodacom-red py-4 font-vodafone-rg-bd text-base font-normal text-white shadow-md shadow-vodacom-red/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading && <LucideIcon icon={Loader2} size={20} className="animate-spin" />}
              {loading
                ? "En cours…"
                : guest.fullName?.trim()
                  ? `Je confirme, ${guest.fullName.trim()} !`
                  : "Je confirme !"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onDecline}
              className="mt-3 w-full py-2 text-center font-vodafone-lt text-xs text-vodacom-black/45 hover:text-vodacom-black/70 disabled:opacity-50"
            >
              Je ne pourrai pas venir
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function DesktopActionLink({
  href,
  icon,
  label,
  external,
}: {
  href: string;
  icon: typeof CalendarPlus;
  label: string;
  external?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="flex items-center gap-3 rounded-xl border border-vodacom-silver/30 bg-vodacom-cream/40 px-3 py-3 font-vodafone-rg-bd text-sm text-vodacom-black transition-colors hover:bg-vodacom-cream"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-vodacom-red text-white">
          <LucideIcon icon={icon} size={18} />
        </span>
        {label}
      </a>
    </li>
  );
}

function DesktopActionButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof CalendarPlus;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex w-full items-center gap-3 rounded-xl border border-vodacom-silver/30 bg-vodacom-cream/40 px-3 py-3 text-left font-vodafone-rg-bd text-sm text-vodacom-black transition-colors hover:bg-vodacom-cream disabled:opacity-60"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-vodacom-red text-white">
          <LucideIcon icon={icon} size={18} />
        </span>
        {label}
      </button>
    </li>
  );
}

function InfoChip({
  icon,
  label,
  value,
  sub,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <li className="rounded-xl border border-vodacom-silver/30 bg-vodacom-cream/50 p-3">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-vodacom-red/10 text-vodacom-red">
        <LucideIcon icon={icon} size={16} />
      </div>
      <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-wide text-vodacom-red">
        {label}
      </p>
      <p className="mt-1 font-vodafone-rg-bd text-sm font-normal leading-snug text-vodacom-black">
        {value}
      </p>
      {sub && <p className="mt-0.5 font-vodafone-lt text-xs text-vodacom-black/55">{sub}</p>}
    </li>
  );
}

function ContactSection() {
  return (
    <footer className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-vodacom-silver/25">
      <div className="flex items-center gap-3 border-b border-vodacom-silver/20 bg-vodacom-cream/40 px-5 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vodacom-red text-white shadow-sm shadow-vodacom-red/20">
          <LucideIcon icon={Headphones} size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="font-vodafone-exb text-lg font-normal leading-tight text-vodacom-black">
            Contact
          </h2>
          <p className="mt-0.5 font-vodafone-lt text-sm text-vodacom-black/60">
            Une question sur votre invitation ?
          </p>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2">
        <ContactChannelLink
          href={`mailto:${EVENT.contactEmail}`}
          icon={Mail}
          label="E-mail"
          value={EVENT.contactEmail}
        />
        <ContactChannelLink
          href={`tel:${EVENT.contactPhone.replace(/\s/g, "")}`}
          icon={Phone}
          label="Téléphone"
          value={EVENT.contactPhone}
        />
      </div>

      <div className="flex gap-2.5 border-t border-vodacom-silver/15 bg-vodacom-cream/30 px-5 py-3.5">
        <LucideIcon
          icon={Shield}
          size={16}
          className="mt-0.5 shrink-0 text-vodacom-black/35"
        />
        <p className="font-vodafone-lt text-xs leading-relaxed text-vodacom-black/50">
          <span className="font-vodafone-rg-bd text-vodacom-black/65">{EVENT.organizer}</span>
          {" — "}
          Données utilisées uniquement pour la gestion de l&apos;événement (RSVP, accueil).
        </p>
      </div>
    </footer>
  );
}

function ContactChannelLink({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      className="group flex min-w-0 items-start gap-3 rounded-xl border border-vodacom-silver/30 bg-vodacom-cream/40 px-3.5 py-3.5 transition-colors hover:border-vodacom-red/25 hover:bg-vodacom-cream"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-vodacom-red text-white transition-transform group-hover:scale-[1.02]">
        <LucideIcon icon={icon} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block font-vodafone-rg-bd text-[10px] uppercase tracking-wide text-vodacom-red">
          {label}
        </span>
        <span className="mt-1 block break-all font-vodafone-rg-bd text-sm font-normal leading-snug text-vodacom-black group-hover:text-vodacom-red">
          {value}
        </span>
      </span>
    </a>
  );
}
