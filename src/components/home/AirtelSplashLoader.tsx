"use client";

import Image from "next/image";

type Props = {
  className?: string;
};

export function AirtelSplashLoader({ className = "" }: Props) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Chargement"
    >
      <div className="flex flex-col items-center">
        <Image
          src="/img/airtel-a.svg"
          alt="Airtel"
          width={96}
          height={128}
          unoptimized
          priority
          className="h-[6rem] w-auto"
        />
        <div className="mt-7 h-[5px] w-[168px] overflow-hidden rounded-full bg-[#EEEEEE]">
          <div className="airtel-splash-progress h-full w-full rounded-full bg-vodacom-red" />
        </div>
      </div>
    </div>
  );
}
