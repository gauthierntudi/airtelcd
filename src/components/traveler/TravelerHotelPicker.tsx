"use client";

import Image from "next/image";
import { Check, Hotel } from "lucide-react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import type { TravelerHotelOption } from "@/lib/traveler-journey";

type Props = {
  hotels: TravelerHotelOption[];
  /** Ville issue du billet sélectionné (étape 1) */
  destinationCity: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function TravelerHotelPicker({
  hotels,
  destinationCity,
  selectedId,
  onSelect,
}: Props) {
  return (
    <div className="w-full max-w-md sm:max-w-lg">
      <ul
        className="flex flex-col gap-3"
        role="listbox"
        aria-label="Hôtels disponibles"
      >
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            destinationCity={destinationCity ?? "—"}
            selected={selectedId === hotel.id}
            onSelect={() => onSelect(hotel.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function HotelCard({
  hotel,
  destinationCity,
  selected,
  onSelect,
}: {
  hotel: TravelerHotelOption;
  destinationCity: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onSelect}
        className={`group relative w-full overflow-hidden rounded-2xl text-left ring-2 transition duration-200 active:scale-[0.99] ${
          selected
            ? "ring-white shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
            : "ring-white/25 hover:ring-white/45"
        }`}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={hotel.imageUrl}
            alt={hotel.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 32rem"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
          {selected ? (
            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#e60000] text-white shadow-lg">
              <LucideIcon icon={Check} size={18} />
            </span>
          ) : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 px-3.5 py-3 sm:px-4 sm:py-3.5">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              selected ? "bg-[#e60000] text-white" : "bg-white/15 text-white"
            }`}
          >
            <LucideIcon icon={Hotel} size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-vodafone-exb text-base leading-tight text-white sm:text-lg">
              {hotel.name}
            </span>
            <span className="mt-0.5 block font-vodafone-lt text-xs text-white/75 sm:text-sm">
              {destinationCity}
            </span>
          </span>
        </div>
      </button>
    </li>
  );
}
