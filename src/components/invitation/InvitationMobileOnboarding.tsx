"use client";

import { RsvpStatus } from "@prisma/client";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useCarouselSlideInView } from "@/hooks/use-carousel-slide-in-view";
import { InvitationMobileSlideContent } from "@/components/invitation/InvitationMobileSlideContent";
import type { InvitationSharedProps } from "@/components/invitation/invitation-shared";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { InvitationExperienceVideoPreload } from "@/components/invitation/InvitationExperienceVideoPreload";
import { InvitationSlideBackground } from "@/components/invitation/InvitationSlideBackground";
import {
  INVITATION_MOBILE_SLIDES,
  type InvitationSlideConfig,
  type InvitationSlideId,
} from "@/lib/invitation-assets";

function invitationSlideOverlayClass(slideId: InvitationSlideId, index: number) {
  if (index === 0) return "invitation-slide-overlay--welcome";
  if (slideId === "datetime") return "invitation-slide-overlay--red";
  return "invitation-slide-overlay";
}

type OnboardingSlideContentProps = {
  displayName: string | null;
  guest: InvitationSharedProps["guest"];
  confirmedAt: string | null;
  loading: boolean;
  isConfirmed: boolean;
  isDeclined: boolean;
  invitationUrl: string;
  qrImageUrl: string;
  googleCalendarUrl: string;
  icsDownloadUrl: string;
  onDownloadInvitation: () => void | Promise<void>;
  downloadingInvitation: boolean;
  onConfirm: () => void;
};

function MobileOnboardingSlide({
  slide,
  index,
  scrollRef,
  content,
}: {
  slide: InvitationSlideConfig;
  index: number;
  scrollRef: RefObject<HTMLDivElement | null>;
  content: OnboardingSlideContentProps;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useCarouselSlideInView(sectionRef, scrollRef);
  const isRsvp = slide.id === "rsvp";

  return (
    <section
      ref={sectionRef}
      className="relative flex h-full w-full shrink-0 snap-center snap-always flex-col"
      aria-label={slide.stepLabel}
    >
      <div className="absolute inset-0">
        <InvitationSlideBackground
          image={slide.image}
          imageAlt={slide.imageAlt}
          video={slide.video}
          isActive={inView}
          priority={index === 0}
          welcomeObjectPosition={index === 0}
        />
        <div
          className={`absolute inset-0 ${invitationSlideOverlayClass(slide.id, index)}`}
          aria-hidden
        />
      </div>

      <div
        className={`relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden px-5 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[max(7.25rem,calc(env(safe-area-inset-bottom)+6.5rem))] ${
          isRsvp ? "justify-between" : "justify-end"
        }`}
      >
        <InvitationMobileSlideContent
          slideId={slide.id}
          {...content}
        />
      </div>
    </section>
  );
}

export function InvitationMobileOnboarding({
  guest,
  displayName,
  status,
  confirmedAt,
  loading,
  invitationUrl,
  qrImageUrl,
  googleCalendarUrl,
  icsDownloadUrl,
  onDownloadInvitation,
  downloadingInvitation,
  onConfirm,
  onDecline,
}: InvitationSharedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = INVITATION_MOBILE_SLIDES.length;
  const isLast = activeIndex === total - 1;
  const isFirst = activeIndex === 0;
  const activeSlideId = INVITATION_MOBILE_SLIDES[activeIndex]?.id;
  const isDateSlide = activeSlideId === "datetime";
  const isRsvpSlide = activeSlideId === "rsvp";
  const isConfirmed = status === RsvpStatus.CONFIRMED;
  const isDeclined = status === RsvpStatus.DECLINED;
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(Math.max(0, index), total - 1));
  }, [total]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScrollEnd = () => syncIndexFromScroll();
    el.addEventListener("scrollend", onScrollEnd);
    return () => el.removeEventListener("scrollend", onScrollEnd);
  }, [syncIndexFromScroll]);

  function goTo(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    const next = Math.min(Math.max(0, index), total - 1);
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setActiveIndex(next);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-vodacom-black">
      <InvitationExperienceVideoPreload enabled />

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={syncIndexFromScroll}
          className="invitation-onboarding-carousel absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
        {INVITATION_MOBILE_SLIDES.map((slide, index) => (
          <MobileOnboardingSlide
            key={slide.id}
            slide={slide}
            index={index}
            scrollRef={scrollRef}
            content={{
              displayName,
              guest,
              confirmedAt,
              loading,
              isConfirmed,
              isDeclined,
              invitationUrl,
              qrImageUrl,
              googleCalendarUrl,
              icsDownloadUrl,
              onDownloadInvitation,
              downloadingInvitation,
              onConfirm,
            }}
          />
        ))}
        </div>

        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-vodacom-black/80 via-vodacom-black/35 to-transparent px-4 pb-8 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
          <div className="pointer-events-auto flex items-center justify-between gap-3">
            <VodacomLogo variant="white" height={44} priority />
            {!isLast && (
              <button
                type="button"
                onClick={() => goTo(total - 1)}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/20 active:bg-white/10"
              >
                Passer
              </button>
            )}
          </div>
        </header>

        {/* Footer sur le slide actif — fond via overlay, pas de bande séparée */}
        <footer
          className={`invitation-onboarding-footer pointer-events-none absolute inset-x-0 bottom-0 z-40 bg-transparent px-4 ${
            isRsvpSlide ? "pt-0" : "pt-3"
          }`}
        >
          <div className="pointer-events-auto">
        {isLast && !isConfirmed && !isDeclined ? (
          <div className="space-y-2">
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="flex h-[3.75rem] w-full items-center justify-center gap-2 rounded-2xl bg-vodacom-red text-lg font-bold text-white shadow-lg shadow-vodacom-red/25 active:scale-[0.98] disabled:opacity-50"
            >
              {loading && <LucideIcon icon={Loader2} size={22} className="animate-spin" />}
              {loading
                ? "Enregistrement…"
                : guest.firstName?.trim()
                  ? `Je confirme, ${guest.firstName.trim()} !`
                  : "Je confirme !"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onDecline}
              className="w-full py-2.5 text-center text-sm text-white/50 active:text-white/70 disabled:opacity-50"
            >
              Je ne pourrai pas venir
            </button>
          </div>
        ) : isLast ? (
          <div className="space-y-2 pb-0.5">
            <p className="text-center font-vodafone-lt text-sm text-white/75">
              {isConfirmed
                ? "Merci — votre réponse est enregistrée."
                : "Vous pouvez revenir aux étapes précédentes si besoin."}
            </p>
            {isDeclined && (
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className="flex h-[3.75rem] w-full items-center justify-center gap-2 rounded-2xl bg-vodacom-red text-lg font-bold text-white shadow-lg shadow-vodacom-red/25 active:scale-[0.98] disabled:opacity-50"
              >
                {loading && <LucideIcon icon={Loader2} size={22} className="animate-spin" />}
                {loading ? "Enregistrement…" : "Finalement, je confirme"}
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-3">
            {!isFirst && (
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                aria-label="Étape précédente"
                className={
                  isDateSlide
                    ? "flex h-[3.75rem] w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-vodacom-red active:bg-white/90"
                    : "flex h-[3.75rem] w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white active:bg-white/15"
                }
              >
                <LucideIcon icon={ChevronLeft} size={24} />
              </button>
            )}
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className={
                isDateSlide
                  ? "flex h-[3.75rem] flex-1 items-center justify-center gap-2 rounded-2xl bg-white text-lg font-bold text-vodacom-red shadow-lg shadow-black/15 active:scale-[0.98]"
                  : "flex h-[3.75rem] flex-1 items-center justify-center gap-2 rounded-2xl bg-vodacom-red text-lg font-bold text-white shadow-lg shadow-vodacom-red/20 active:scale-[0.98]"
              }
            >
              Continuer
              <LucideIcon icon={ChevronRight} size={24} />
            </button>
          </div>
        )}
          </div>
        </footer>
      </div>
    </div>
  );
}
