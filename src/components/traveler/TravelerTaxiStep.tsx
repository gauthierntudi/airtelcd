"use client";

import Image from "next/image";
import { CarTaxiFront } from "lucide-react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { TRAVELER_TAXI_YANGO_IMAGE } from "@/lib/traveler-journey";

export function TravelerTaxiStep() {
  return (
    <div className="w-full max-w-md sm:max-w-lg">
      <div className="traveler-taxi-yango-card relative overflow-hidden rounded-[1.75rem] ring-2 ring-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.32)]">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-[#e60000]/10"
          aria-hidden
        />

        <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e60000]/20 ring-1 ring-[#e60000]/35">
              <LucideIcon icon={CarTaxiFront} size={20} className="text-white" />
            </span>
            <div>
              <p className="font-vodafone-exb text-sm text-white sm:text-base">
                Course taxi
              </p>
              <p className="font-vodafone-lt text-xs text-white/60">
                Partenaire Yango
              </p>
            </div>
          </div>
        </div>

        <div className="relative aspect-[5/4] w-full bg-gradient-to-b from-white/[0.06] to-black/20">
          <Image
            src={TRAVELER_TAXI_YANGO_IMAGE}
            alt="Yango — réserver votre taxi"
            fill
            priority
            sizes="(max-width: 640px) 100vw, 32rem"
            className="object-contain p-5 sm:p-6"
          />
        </div>

        <div className="relative space-y-1 border-t border-white/10 px-4 py-4 text-center sm:px-5">
          <p className="font-vodafone-rg-bd text-sm text-white sm:text-base">
            Réservez votre trajet
          </p>
          <p className="font-vodafone-lt text-xs leading-relaxed text-white/70 sm:text-sm">
            Commandez votre taxi Yango pour vos déplacements pendant le séjour.
          </p>
        </div>
      </div>
    </div>
  );
}
