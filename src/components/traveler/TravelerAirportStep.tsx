"use client";

import Image from "next/image";
import {
  TRAVELER_AIRPORT_BODY_COPY,
  TRAVELER_AIRPORT_HEADLINE,
  TRAVELER_AIRPORT_PHONE_IMAGE,
} from "@/lib/traveler-journey";

export function TravelerAirportStep() {
  return (
    <div className="relative flex w-full max-w-lg flex-col items-center justify-center px-2 py-2 text-center sm:max-w-xl sm:px-4">
      <div className="relative z-10 mx-auto max-w-md space-y-4 px-2 sm:max-w-lg">
        <p className="font-vodafone-lt text-base leading-relaxed text-white/90 sm:text-lg">
          {TRAVELER_AIRPORT_BODY_COPY}
        </p>
        <h2 className="font-vodafone-exb text-[2rem] font-normal leading-[1.05] tracking-tight text-white sm:text-[2.65rem]">
          {TRAVELER_AIRPORT_HEADLINE}
        </h2>
      </div>

      <div className="relative z-10 mt-6 w-full max-w-[17rem] sm:mt-8 sm:max-w-[19rem]">
        <div className="traveler-airport-figure-float relative aspect-[3/4] w-full">
          <Image
            src={TRAVELER_AIRPORT_PHONE_IMAGE}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 640px) 68vw, 19rem"
            className="object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
          />
        </div>
      </div>
    </div>
  );
}
