"use client";

import Image from "next/image";
import { TRAVELER_AIRPORT_BG_IMAGE } from "@/lib/traveler-journey";

export function TravelerAirportBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <Image
        src={TRAVELER_AIRPORT_BG_IMAGE}
        alt=""
        fill
        priority
        unoptimized
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/70" />
    </div>
  );
}
