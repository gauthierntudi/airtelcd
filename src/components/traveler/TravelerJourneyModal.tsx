"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { PurchasedForfaitVerticalStack } from "@/components/privilege/PurchasedForfaitVerticalStack";
import { TravelerBilletPicker } from "@/components/traveler/TravelerBilletPicker";
import { TravelerHotelPicker } from "@/components/traveler/TravelerHotelPicker";
import { TravelerAirportBackground } from "@/components/traveler/TravelerAirportBackground";
import { TravelerAirportStep } from "@/components/traveler/TravelerAirportStep";
import { TravelerBookingRecapModal } from "@/components/traveler/TravelerBookingRecapModal";
import { TravelerConversionUssdModal } from "@/components/traveler/TravelerConversionUssdModal";
import { TravelerConversionStep } from "@/components/traveler/TravelerConversionStep";
import { TravelerJourneyFinishScreen } from "@/components/traveler/TravelerJourneyFinishScreen";
import { TravelerTaxiStep } from "@/components/traveler/TravelerTaxiStep";
import { TravelerProgressBar } from "@/components/traveler/TravelerProgressBar";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  TravelerBilletVideoBackground,
  type TravelerBilletVideoBackgroundHandle,
} from "@/components/traveler/TravelerBilletVideoBackground";
import {
  getTravelerBilletById,
  getTravelerHotelById,
  getTravelerJourneyStep,
  TRAVELER_BILLET_OPTIONS,
  TRAVELER_HOTEL_OPTIONS,
} from "@/lib/traveler-journey";

type Props = {
  open: boolean;
  step: number;
  onClose: () => void;
  onContinue: () => void;
  continuing?: boolean;
  onAuthRequired?: () => void;
};

export function TravelerJourneyModal({
  open,
  step,
  onClose,
  onContinue,
  continuing = false,
  onAuthRequired,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [selectedBilletId, setSelectedBilletId] = useState<string | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [bookingRecapOpen, setBookingRecapOpen] = useState(false);
  const [conversionUssdOpen, setConversionUssdOpen] = useState(false);
  const [finishScreenOpen, setFinishScreenOpen] = useState(false);
  const videoBackgroundRef = useRef<TravelerBilletVideoBackgroundHandle>(null);
  const current = getTravelerJourneyStep(step);
  const isLastStep = step >= 5;
  const isBilletStep = current.id === "billet";
  const isHotelStep = current.id === "hotel";
  const isTaxiStep = current.id === "taxi";
  const isAirportStep = current.id === "aeroport";
  const isConversionStep = current.id === "conversion";
  const requiresSelection = isBilletStep || isHotelStep;
  const hasSelection = isBilletStep
    ? selectedBilletId !== null
    : isHotelStep
      ? selectedHotelId !== null
      : true;
  const canContinue = !continuing && hasSelection;
  const showFooter = !requiresSelection || hasSelection;
  const selectedBillet = getTravelerBilletById(selectedBilletId);
  const selectedHotel = getTravelerHotelById(selectedHotelId);
  const billetVideoUrl =
    isBilletStep && selectedBillet ? selectedBillet.videoUrl : null;
  const billetPreloadUrls = isBilletStep
    ? TRAVELER_BILLET_OPTIONS.map((b) => b.videoUrl)
    : [];
  const hasStepBackground = Boolean(billetVideoUrl) || isAirportStep;
  const hotelDestination = selectedBillet?.to ?? null;
  const stepTitle =
    isHotelStep && hotelDestination
      ? `Choisissez votre hôtel · ${hotelDestination}`
      : current.title;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setSelectedBilletId(null);
      setSelectedHotelId(null);
      setBookingRecapOpen(false);
      setConversionUssdOpen(false);
      setFinishScreenOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!isHotelStep) setSelectedHotelId(null);
  }, [isHotelStep, selectedBilletId]);

  function handleFooterClick() {
    if (isHotelStep && selectedBillet && selectedHotel) {
      setBookingRecapOpen(true);
      return;
    }
    if (isAirportStep) {
      setConversionUssdOpen(true);
      return;
    }
    if (isLastStep) {
      setFinishScreenOpen(true);
      return;
    }
    onContinue();
  }

  const footerLabel = continuing
    ? "Ouverture…"
    : isTaxiStep
      ? "Réserver le taxi"
      : isLastStep
        ? "Terminer le parcours"
        : "Continuer";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[67] flex flex-col overflow-hidden font-vodafone-lt text-white">
      <TravelerBilletVideoBackground
        ref={videoBackgroundRef}
        activeVideoUrl={billetVideoUrl}
        preloadUrls={billetPreloadUrls}
      />
      {isAirportStep ? <TravelerAirportBackground /> : null}
      {!hasStepBackground ? (
        <>
          <div
            className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-10 bottom-40 h-48 w-48 rounded-full bg-[#e60000]/30 blur-3xl"
            aria-hidden
          />
        </>
      ) : null}

      <header className="relative z-30 flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8">
        <VodacomLogo variant="white" height={34} />
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/15 active:scale-95"
          aria-label="Fermer"
        >
          <LucideIcon icon={X} size={20} />
        </button>
      </header>

      <section className="relative z-30 shrink-0 px-4 pt-1 text-center sm:px-8">
        <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.22em] text-white/70 sm:text-xs">
          Parcours Traveler · Étape {step}/5
        </p>
        <h1 className="mt-2 font-vodafone-exb text-[1.5rem] font-normal leading-tight tracking-tight sm:text-[1.85rem]">
          {stepTitle}
        </h1>
      </section>

      <div className="relative z-20 flex shrink-0 justify-center px-4 py-4 sm:px-8 sm:py-5">
        <TravelerProgressBar currentStep={step} />
      </div>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 sm:px-8">
        <PurchasedForfaitVerticalStack
          className="pointer-events-none fixed left-[5%] top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
          activeBenefitIds={current.activeBenefitIds}
        />

        <div className="experience-profile-enter mx-auto flex min-h-full w-full flex-col items-center justify-center px-2 py-4 sm:px-4">
          {isBilletStep ? (
            <TravelerBilletPicker
              selectedId={selectedBilletId}
              onSelect={setSelectedBilletId}
              onPrefetchVideo={(url) => videoBackgroundRef.current?.prefetch(url)}
            />
          ) : isHotelStep ? (
            <TravelerHotelPicker
              hotels={TRAVELER_HOTEL_OPTIONS}
              destinationCity={hotelDestination}
              selectedId={selectedHotelId}
              onSelect={setSelectedHotelId}
            />
          ) : isTaxiStep ? (
            <TravelerTaxiStep />
          ) : isAirportStep ? (
            <TravelerAirportStep />
          ) : isConversionStep ? (
            <TravelerConversionStep />
          ) : (
            <div className="flex max-w-md flex-col items-center px-4 text-center sm:max-w-lg sm:px-6">
              <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/12 ring-2 ring-white/25 sm:h-[4.5rem] sm:w-[4.5rem]">
                <LucideIcon icon={current.icon} size={30} className="text-white" />
              </span>
              <p className="font-vodafone-lt text-sm leading-relaxed text-white/85 sm:text-base">
                {current.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <footer
        className={`relative z-40 mt-auto shrink-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 transition-all duration-300 sm:px-8 ${
          showFooter
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={handleFooterClick}
          disabled={!canContinue}
          className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-white py-3.5 font-vodafone-rg-bd text-base text-vodacom-red shadow-lg transition active:scale-[0.98] disabled:opacity-60"
        >
          {continuing && (
            <LucideIcon icon={Loader2} size={20} className="animate-spin" />
          )}
          {footerLabel}
        </button>
      </footer>
      {selectedBillet && selectedHotel ? (
        <TravelerBookingRecapModal
          open={bookingRecapOpen}
          billet={selectedBillet}
          hotel={selectedHotel}
          onClose={() => setBookingRecapOpen(false)}
          onComplete={() => {
            setBookingRecapOpen(false);
            onContinue();
          }}
          onAuthRequired={onAuthRequired}
        />
      ) : null}
      <TravelerConversionUssdModal
        open={conversionUssdOpen}
        onClose={() => setConversionUssdOpen(false)}
        onComplete={() => {
          setConversionUssdOpen(false);
          onContinue();
        }}
      />
      {finishScreenOpen ? (
        <TravelerJourneyFinishScreen
          onComplete={() => {
            setFinishScreenOpen(false);
            onContinue();
          }}
        />
      ) : null}
    </div>,
    document.body,
  );
}
