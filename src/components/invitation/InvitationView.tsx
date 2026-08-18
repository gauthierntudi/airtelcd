"use client";

import { RsvpStatus } from "@prisma/client";
import {
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  MapPin,
  Navigation,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { InvitationQrCode } from "@/components/invitation/InvitationQrCode";
import { InvitationRsvpConfirmSheet } from "@/components/invitation/InvitationRsvpConfirmSheet";
import {
  INVITATION_HERO_IMAGES,
  pickInvitationHeroImage,
  type InvitationHeroImage,
  type InvitationSharedProps,
} from "@/components/invitation/invitation-shared";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  buildInvitedWeekCalendarCells,
  CALENDAR_WEEKDAY_LABELS,
  formatInvitedDayLong,
  type EventDayId,
} from "@/lib/event-days";
import {
  formatFrTimeRange,
  isoDateParts,
  parseFrTimeRange,
} from "@/lib/events";
import { formatInvitationDateTime } from "@/lib/format-invitation-date";
import { sortEventDayIds } from "@/lib/parse-event-day";

const STATUS_PILL: Record<RsvpStatus, string> = {
  PENDING: "bg-white/15 text-white ring-1 ring-white/30",
  CONFIRMED: "bg-emerald-500 text-white",
  DECLINED: "bg-white/20 text-white ring-1 ring-white/25",
};

const STATUS_LABEL: Record<RsvpStatus, string> = {
  PENDING: "À confirmer",
  CONFIRMED: "Confirmé",
  DECLINED: "Décliné",
};

const STEPS = [
  { id: "welcome", label: "Invitation" },
  { id: "when", label: "Date et lieu" },
  { id: "pass", label: "Pass d'accès" },
] as const;

const SLIDE =
  "relative flex h-full w-full min-w-full max-w-full basis-full shrink-0 snap-center snap-always flex-col overflow-hidden";

const SLIDE_FOOTER_PAD =
  "pb-[max(10.75rem,calc(env(safe-area-inset-bottom)+9.5rem))]";

const LAST_INDEX = STEPS.length - 1;

type StoredInviteScreen = {
  step: number;
  selectedDay?: string;
};

function inviteScreenKey(token: string) {
  return `airtel-invite-screen:${token}`;
}

function readStoredScreen(token: string): StoredInviteScreen | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(inviteScreenKey(token));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredInviteScreen;
    if (
      typeof parsed.step !== "number" ||
      parsed.step < 0 ||
      parsed.step > LAST_INDEX
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredScreen(token: string, value: StoredInviteScreen) {
  try {
    window.localStorage.setItem(inviteScreenKey(token), JSON.stringify(value));
  } catch {
    /* quota / mode privé */
  }
}

export function InvitationView({
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
  const event = guest.event;
  const isConfirmed = status === RsvpStatus.CONFIRMED;
  const isDeclined = status === RsvpStatus.DECLINED;
  const invitedDays = sortEventDayIds(guest.eventDays);
  const firstDay = invitedDays[0] ?? event.startDate;
  const [selectedDay, setSelectedDay] = useState<EventDayId>(firstDay);
  const selected = invitedDays.includes(selectedDay) ? selectedDay : firstDay;
  const selectedSchedule =
    event.dayTimes[selected] ?? parseFrTimeRange(event.timeRange);
  const monthAnchor = isoDateParts(firstDay);
  const cells = buildInvitedWeekCalendarCells(invitedDays, firstDay);
  const monthLabel = `${monthAnchor.monthLong} ${monthAnchor.year}`;
  const selectedParts = isoDateParts(selected);
  const firstName = displayName?.trim().split(/\s+/)[0];

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastIndex = LAST_INDEX;
  const restoredRef = useRef(false);
  const [heroSrc, setHeroSrc] = useState<InvitationHeroImage>(
    INVITATION_HERO_IMAGES[0],
  );
  const [incomingSrc, setIncomingSrc] = useState<InvitationHeroImage | null>(
    null,
  );
  const [incomingVisible, setIncomingVisible] = useState(false);
  const [passActionsOpen, setPassActionsOpen] = useState(false);
  const [rsvpIntent, setRsvpIntent] = useState<"confirm" | "decline" | null>(
    null,
  );
  const [hydrated, setHydrated] = useState(false);
  const [activeIndex, setActiveIndex] = useState(isConfirmed ? lastIndex : 0);
  const isLast = activeIndex === lastIndex;
  const isFirst = activeIndex === 0;
  const isWhen = activeIndex === 1;
  const isLightHeader = isWhen || isLast;
  const isFirstRef = useRef(isFirst);
  const incomingLoadedRef = useRef(false);
  const wasFirstRef = useRef(isFirst);
  isFirstRef.current = isFirst;

  useLayoutEffect(() => {
    setHeroSrc(pickInvitationHeroImage());
  }, []);

  useEffect(() => {
    const leftWelcome = wasFirstRef.current && !isFirst;
    const returnedToWelcome = !wasFirstRef.current && isFirst;
    wasFirstRef.current = isFirst;

    if (leftWelcome) {
      incomingLoadedRef.current = false;
      setIncomingVisible(false);
      setIncomingSrc(pickInvitationHeroImage(heroSrc));
      return;
    }

    if (returnedToWelcome && incomingLoadedRef.current) {
      setIncomingVisible(true);
    }
  }, [isFirst, heroSrc]);

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(Math.max(0, index), lastIndex));
  }, [lastIndex]);

  function goTo(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    const next = Math.min(Math.max(0, index), lastIndex);
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setActiveIndex(next);
  }

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!restoredRef.current) {
      restoredRef.current = true;
      const stored = readStoredScreen(guest.token);
      const step = stored?.step ?? (isConfirmed ? lastIndex : 0);
      if (stored?.selectedDay && invitedDays.includes(stored.selectedDay)) {
        setSelectedDay(stored.selectedDay);
      }
      setActiveIndex(step);
      if (el && el.clientWidth > 0) {
        el.scrollTo({ left: step * el.clientWidth });
      }
      setHydrated(true);
      return;
    }
    if (!el || el.clientWidth === 0) return;
    el.scrollTo({ left: activeIndex * el.clientWidth });
  }, [activeIndex, guest.token, isConfirmed, lastIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScrollEnd = () => syncIndexFromScroll();
    el.addEventListener("scrollend", onScrollEnd);
    return () => el.removeEventListener("scrollend", onScrollEnd);
  }, [syncIndexFromScroll]);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredScreen(guest.token, {
      step: activeIndex,
      selectedDay: selected,
    });
  }, [hydrated, guest.token, activeIndex, selected]);

  return (
    <div className="invitation-rsvp-shell h-dvh overflow-hidden bg-zinc-950 sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-8">
      <div className="relative mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden bg-black sm:h-[min(720px,calc(100dvh-4rem))] sm:rounded-[2rem]">
        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-[max(0.85rem,env(safe-area-inset-top))]">
          <VodacomLogo
            variant="color"
            height={40}
            priority
            className={`pointer-events-auto ${isLightHeader ? "" : "brightness-0 invert"}`}
          />
          <div className="pointer-events-auto flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                isLightHeader
                  ? status === RsvpStatus.CONFIRMED
                    ? "bg-emerald-500 text-white"
                    : "bg-vodacom-red text-white"
                  : STATUS_PILL[status]
              }`}
            >
              {STATUS_LABEL[status]}
            </span>
            {!isLast && (
              <button
                type="button"
                onClick={() => goTo(lastIndex)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${
                  isLightHeader
                    ? "text-vodacom-red ring-vodacom-red/25"
                    : "text-white/80 ring-white/25"
                }`}
              >
                Passer
              </button>
            )}
          </div>
        </header>

        <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={syncIndexFromScroll}
          className="invitation-onboarding-carousel absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <section className={SLIDE} aria-label={STEPS[0].label}>
            <div className="absolute inset-0" aria-hidden>
              <Image
                src={heroSrc}
                alt=""
                fill
                priority
                sizes="(max-width: 512px) 100vw, 512px"
                className="object-cover object-center"
              />
              {incomingSrc ? (
                <div
                  className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out ${
                    incomingVisible ? "opacity-100" : "opacity-0"
                  }`}
                  onTransitionEnd={(event) => {
                    if (event.propertyName !== "opacity") return;
                    if (!incomingVisible || !incomingSrc) return;
                    incomingLoadedRef.current = false;
                    setHeroSrc(incomingSrc);
                    setIncomingSrc(null);
                    setIncomingVisible(false);
                  }}
                >
                  <Image
                    src={incomingSrc}
                    alt=""
                    fill
                    sizes="(max-width: 512px) 100vw, 512px"
                    className="object-cover object-center"
                    onLoadingComplete={() => {
                      incomingLoadedRef.current = true;
                      if (isFirstRef.current) setIncomingVisible(true);
                    }}
                  />
                </div>
              ) : null}
            </div>
            <div
              className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/25"
              aria-hidden
            />
            <div className={`relative z-10 mt-auto px-5 pt-[max(5rem,calc(env(safe-area-inset-top)+4rem))] ${SLIDE_FOOTER_PAD}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                Invitation
              </p>
              <h1 className="mt-1.5 font-vodafone-exb text-[1.75rem] font-normal leading-[1.15] tracking-tight text-white">
                {displayName ? (
                  <>
                    {displayName},
                    <span className="mt-1 block text-[1.35rem] text-white/85">
                      vous êtes invité(e)
                    </span>
                  </>
                ) : (
                  "Vous êtes invité(e)"
                )}
              </h1>
              <p className="mt-2 text-base font-semibold leading-snug text-white">
                {event.name}
              </p>
            </div>
          </section>

          <section
            className={`${SLIDE} bg-white`}
            aria-label={STEPS[1].label}
          >
            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col justify-end px-5 pb-4 pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.25rem))]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-vodacom-red/70">
                Date et lieu
              </p>
              <h2 className="mt-1.5 w-full min-w-0 text-[2.35rem] font-extrabold leading-[1.08] tracking-tight text-vodacom-red break-words [overflow-wrap:anywhere]">
                {event.name}
              </h2>
            </div>

            <div className="flex min-h-0 flex-[1.75] flex-col rounded-t-[1.85rem] bg-vodacom-red px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 text-white">
              <div className="flex min-h-0 flex-1 flex-col justify-center gap-5">
                <div className="shrink-0">
                  <p className="text-center text-2xl capitalize leading-none">
                    <span className="font-bold">{monthAnchor.monthLong}</span>{" "}
                    <span className="font-thin">{monthAnchor.year}</span>
                  </p>
                  <div
                    className="mt-3 grid grid-cols-7"
                    role="grid"
                    aria-label={`Semaine de l'événement, ${monthLabel}`}
                  >
                    {CALENDAR_WEEKDAY_LABELS.map((label, index) => (
                      <div
                        key={`wd-${index}`}
                        className="pb-2 text-center text-[clamp(0.6rem,2.6vw,0.7rem)] font-semibold uppercase tracking-wide text-white/55"
                      >
                        {label}
                      </div>
                    ))}
                    {cells.map((cell) => {
                      if (cell.kind === "pad") {
                        return (
                          <div
                            key={cell.key}
                            className="aspect-square w-full"
                            aria-hidden
                          />
                        );
                      }
                      const isInvited = cell.isEventDay;
                      const isSelected = isInvited && cell.dayId === selected;
                      if (!isInvited) {
                        return (
                          <div
                            key={cell.key}
                            className="flex aspect-square w-full items-center justify-center"
                          >
                            <span className="text-[clamp(0.8rem,3.4vw,1rem)] text-white/35">
                              {cell.date}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={cell.key}
                          className="flex aspect-square w-full items-center justify-center p-[8%]"
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedDay(cell.dayId!)}
                            aria-label={formatInvitedDayLong(cell.dayId!)}
                            aria-pressed={isSelected}
                            className={`flex h-full w-full items-center justify-center rounded-full text-[clamp(0.8rem,3.4vw,1rem)] font-bold transition-colors ${
                              isSelected
                                ? "bg-white text-vodacom-red"
                                : "bg-white/20 text-white"
                            }`}
                          >
                            {cell.date}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div
                  className="shrink-0 overflow-hidden rounded-2xl border border-white bg-vodacom-red text-white"
                  aria-live="polite"
                >
                  <div className="flex items-stretch">
                    <div className="flex w-[4.75rem] shrink-0 flex-col items-center justify-center border-r border-white px-2 py-3.5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                        {selectedParts.weekday.replace(".", "")}
                      </span>
                      <span className="mt-0.5 text-[1.85rem] font-extrabold leading-none">
                        {selectedParts.day}
                      </span>
                      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80">
                        {selectedParts.month}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                          <LucideIcon icon={Clock} size={15} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">
                            Horaires
                          </p>
                          <p className="text-[15px] font-bold leading-tight">
                            {formatFrTimeRange(selectedSchedule)}
                          </p>
                        </div>
                      </div>
                      {event.venue ? (
                        <a
                          href={event.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                            <LucideIcon icon={MapPin} size={15} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">
                              Lieu
                            </p>
                            <p className="truncate text-[15px] font-bold leading-tight">
                              {event.venue}
                            </p>
                          </div>
                          <LucideIcon
                            icon={ChevronRight}
                            size={16}
                            className="shrink-0 text-white/50"
                          />
                        </a>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                            <LucideIcon icon={MapPin} size={15} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">
                              Lieu
                            </p>
                            <p className="text-[15px] font-bold leading-tight">
                              Lieu à préciser
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 shrink-0">
                <nav className="mb-2 flex justify-center" aria-label="Progression">
                  <div className="flex items-center gap-2">
                    {STEPS.map((step, index) => {
                      const current = index === activeIndex;
                      const done = index < activeIndex;
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => goTo(index)}
                          aria-label={step.label}
                          aria-current={current ? "step" : undefined}
                          className={`rounded-full outline-none transition-all duration-300 focus-visible:ring-1 focus-visible:ring-white ${
                            current
                              ? "h-2 w-7 bg-white"
                              : done
                                ? "h-2 w-2 bg-white/80"
                                : "h-2 w-2 bg-white/35"
                          }`}
                        />
                      );
                    })}
                  </div>
                </nav>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex - 1)}
                    aria-label="Étape précédente"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <LucideIcon icon={ChevronLeft} size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex + 1)}
                    className="flex h-14 min-w-0 flex-1 items-center justify-between rounded-2xl bg-white px-4 text-vodacom-red outline-none active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span className="min-w-0 text-left">
                      <span className="block text-[17px] font-extrabold leading-tight">
                        Continuer
                      </span>
                      <span className="block truncate text-[11px] font-medium text-zinc-400">
                        {STEPS[2].label}
                      </span>
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vodacom-red text-white">
                      <LucideIcon icon={ChevronRight} size={18} />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className={`${SLIDE} bg-white`} aria-label={STEPS[2].label}>
            <div className="w-full min-w-0 shrink-0 px-5 pb-4 pt-[max(6.75rem,calc(env(safe-area-inset-top)+5.25rem))]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-vodacom-red/70">
                Pass d&apos;accès
              </p>
              <h2 className="mt-1.5 w-full min-w-0 text-[2.35rem] font-extrabold leading-[1.08] tracking-tight text-vodacom-red break-words [overflow-wrap:anywhere]">
                {isConfirmed
                  ? "Présence confirmée"
                  : isDeclined
                    ? "Pass inactif"
                    : "Activez votre pass"}
              </h2>
            </div>

            <div className="flex min-h-0 flex-1 flex-col rounded-t-[1.85rem] bg-vodacom-red px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 text-white">
              <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
                <div className="mx-auto w-full max-w-[15.75rem]">
                  <div className="relative">
                    <span
                      className="absolute -left-2.5 top-[72%] z-10 h-5 w-5 -translate-y-1/2 rounded-full bg-vodacom-red"
                      aria-hidden
                    />
                    <span
                      className="absolute -right-2.5 top-[72%] z-10 h-5 w-5 -translate-y-1/2 rounded-full bg-vodacom-red"
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => setPassActionsOpen((open) => !open)}
                      aria-expanded={passActionsOpen}
                      aria-controls="invitation-pass-actions"
                      className="w-full overflow-hidden rounded-[1.35rem] bg-white text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <div className="px-3.5 pb-2 pt-3.5">
                        <InvitationQrCode
                          value={invitationUrl}
                          className="mx-auto w-full"
                        />
                      </div>
                      <div
                        className="mx-3 border-t border-dashed border-zinc-200"
                        aria-hidden
                      />
                      <div className="flex items-center justify-center gap-1 px-3.5 pb-3 pt-2.5">
                        <p className="truncate text-sm font-bold leading-tight">
                          Pass d&apos;Accès
                        </p>
                        <LucideIcon
                          icon={ChevronDown}
                          size={16}
                          className={`shrink-0 text-zinc-400 transition-transform duration-300 ${
                            passActionsOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                </div>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    passActionsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <nav
                      id="invitation-pass-actions"
                      className={`overflow-hidden rounded-2xl border border-white ${
                        passActionsOpen ? "" : "pointer-events-none"
                      }`}
                      aria-label="Actions invitation"
                      aria-hidden={!passActionsOpen}
                    >
                      <div className="grid grid-cols-3 divide-x divide-white/30">
                    <a
                      href={googleCalendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Ajouter au calendrier"
                      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-1.5 py-2.5 text-center outline-none"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 text-white">
                        <LucideIcon icon={CalendarPlus} size={16} />
                      </span>
                      <span className="text-[11px] font-semibold leading-tight text-white">
                        Calendrier
                      </span>
                    </a>
                    <a
                      href={event.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Ouvrir l'itinéraire"
                      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-1.5 py-2.5 text-center outline-none"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 text-white">
                        <LucideIcon icon={Navigation} size={16} />
                      </span>
                      <span className="text-[11px] font-semibold leading-tight text-white">
                        Itinéraire
                      </span>
                    </a>
                    <button
                      type="button"
                      onClick={() => void onDownloadInvitation()}
                      disabled={downloadingInvitation}
                      aria-busy={downloadingInvitation}
                      aria-label="Enregistrer le pass"
                      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-1.5 py-2.5 text-center outline-none disabled:opacity-60"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 text-white">
                        <LucideIcon
                          icon={downloadingInvitation ? Loader2 : Download}
                          size={16}
                          className={
                            downloadingInvitation ? "animate-spin" : undefined
                          }
                        />
                      </span>
                      <span className="text-[11px] font-semibold leading-tight text-white">
                        {downloadingInvitation ? "En cours" : "Enregistrer"}
                      </span>
                    </button>
                  </div>
                </nav>
                  </div>
                </div>
              </div>

              <div className="mt-4 shrink-0">
                <nav className="mb-2 flex justify-center" aria-label="Progression">
                  <div className="flex items-center gap-2">
                    {STEPS.map((step, index) => {
                      const current = index === activeIndex;
                      const done = index < activeIndex;
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => goTo(index)}
                          aria-label={step.label}
                          aria-current={current ? "step" : undefined}
                          className={`rounded-full outline-none transition-all duration-300 focus-visible:ring-1 focus-visible:ring-white ${
                            current
                              ? "h-2 w-7 bg-white"
                              : done
                                ? "h-2 w-2 bg-white/80"
                                : "h-2 w-2 bg-white/35"
                          }`}
                        />
                      );
                    })}
                  </div>
                </nav>
                {isConfirmed ? (
                  <div className="flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                      <LucideIcon icon={CheckCircle2} size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-extrabold leading-tight text-zinc-900">
                        Présence confirmée
                      </p>
                      {confirmedAt ? (
                        <p
                          className="text-xs text-zinc-500"
                          suppressHydrationWarning
                        >
                          {formatInvitationDateTime(confirmedAt)}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-500">
                          Pass d&apos;accès activé
                        </p>
                      )}
                    </div>
                  </div>
                ) : isDeclined ? (
                  <div>
                    <p className="mb-2 text-center text-sm font-medium text-white/80">
                      Vous avez décliné l&apos;invitation
                    </p>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => goTo(activeIndex - 1)}
                        aria-label="Étape précédente"
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <LucideIcon icon={ChevronLeft} size={22} />
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setRsvpIntent("confirm")}
                        className="flex h-14 min-w-0 flex-1 items-center justify-between rounded-2xl bg-white px-4 text-vodacom-red outline-none active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50"
                      >
                        <span className="min-w-0 text-left">
                          <span className="block text-[17px] font-extrabold leading-tight">
                            {loading ? "En cours…" : "Finalement, je confirme"}
                          </span>
                          <span className="block truncate text-[11px] font-medium text-zinc-400">
                            Activer le pass
                          </span>
                        </span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vodacom-red text-white">
                          {loading ? (
                            <LucideIcon
                              icon={Loader2}
                              size={18}
                              className="animate-spin"
                            />
                          ) : (
                            <LucideIcon icon={Check} size={18} />
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => goTo(activeIndex - 1)}
                        aria-label="Étape précédente"
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <LucideIcon icon={ChevronLeft} size={22} />
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setRsvpIntent("confirm")}
                        className="flex h-14 min-w-0 flex-1 items-center justify-between rounded-2xl bg-white px-4 text-vodacom-red outline-none active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50"
                      >
                        <span className="min-w-0 text-left">
                          <span className="block text-[17px] font-extrabold leading-tight">
                            {loading
                              ? "En cours…"
                              : firstName
                                ? `Je confirme, ${firstName}`
                                : "Je confirme"}
                          </span>
                          <span className="block truncate text-[11px] font-medium text-zinc-400">
                            Activer le pass d&apos;accès
                          </span>
                        </span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vodacom-red text-white">
                          {loading ? (
                            <LucideIcon
                              icon={Loader2}
                              size={18}
                              className="animate-spin"
                            />
                          ) : (
                            <LucideIcon icon={Check} size={18} />
                          )}
                        </span>
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setRsvpIntent("decline")}
                      className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-white/15 text-sm font-semibold text-white outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50"
                    >
                      Je ne pourrai pas venir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <footer
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-10 ${
            isWhen || isLast
              ? "hidden"
              : isFirst
                ? "bg-gradient-to-t from-black via-black/80 to-transparent"
                : "bg-gradient-to-t from-vodacom-red via-vodacom-red to-transparent"
          }`}
        >
          <div className="pointer-events-auto">
          <nav className="mb-2 flex justify-center" aria-label="Progression">
            <div className="flex items-center gap-2">
              {STEPS.map((step, index) => {
                const current = index === activeIndex;
                const done = index < activeIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={step.label}
                    aria-current={current ? "step" : undefined}
                    className={`rounded-full outline-none transition-all duration-300 focus-visible:ring-1 focus-visible:ring-white ${
                      current
                        ? "h-2 w-7 bg-white"
                        : done
                          ? "h-2 w-2 bg-white/80"
                          : "h-2 w-2 bg-white/35"
                    }`}
                  />
                );
              })}
            </div>
          </nav>

          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="flex h-14 w-full items-center justify-between rounded-2xl bg-white px-4 text-vodacom-red outline-none active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-white"
          >
            <span className="min-w-0 text-left">
              <span className="block font-vodafone-exb text-[17px] leading-tight">
                Continuer
              </span>
              <span className="block truncate text-[11px] font-medium text-zinc-400">
                {STEPS[activeIndex + 1]?.label}
              </span>
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vodacom-red text-white">
              <LucideIcon icon={ChevronRight} size={18} />
            </span>
          </button>
          </div>
        </footer>
        </div>
        {rsvpIntent ? (
          <InvitationRsvpConfirmSheet
            intent={rsvpIntent}
            firstName={firstName}
            loading={loading}
            onClose={() => setRsvpIntent(null)}
            onSubmit={() => {
              const intent = rsvpIntent;
              setRsvpIntent(null);
              if (intent === "confirm") onConfirm();
              else onDecline();
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
