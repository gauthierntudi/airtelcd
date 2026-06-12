"use client";

import { Plane, Ticket } from "lucide-react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  TRAVELER_BILLET_OPTIONS,
  type TravelerBilletOption,
} from "@/lib/traveler-journey";

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPrefetchVideo?: (videoUrl: string) => void;
};

export function TravelerBilletPicker({
  selectedId,
  onSelect,
  onPrefetchVideo,
}: Props) {
  return (
    <div className="w-full max-w-md sm:max-w-lg">
      <p className="mb-4 text-center font-vodafone-lt text-sm leading-relaxed text-white/85 sm:text-base">
        Sélectionnez un billet pour votre voyage au Kinshasa Open de Golf.
      </p>
      <ul className="flex flex-col gap-3" role="listbox" aria-label="Billets disponibles">
        {TRAVELER_BILLET_OPTIONS.map((billet) => (
          <BilletCard
            key={billet.id}
            billet={billet}
            selected={selectedId === billet.id}
            onSelect={() => onSelect(billet.id)}
            onPrefetch={() => onPrefetchVideo?.(billet.videoUrl)}
          />
        ))}
      </ul>
    </div>
  );
}

function BilletCard({
  billet,
  selected,
  onSelect,
  onPrefetch,
}: {
  billet: TravelerBilletOption;
  selected: boolean;
  onSelect: () => void;
  onPrefetch?: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onSelect}
        onMouseEnter={onPrefetch}
        onFocus={onPrefetch}
        className={`flex w-full items-stretch gap-3 rounded-2xl p-3.5 text-left ring-2 transition duration-200 active:scale-[0.99] sm:gap-4 sm:p-4 ${
          selected
            ? "bg-white/18 ring-white shadow-[0_8px_28px_rgba(0,0,0,0.28)]"
            : "bg-white/8 ring-white/20 hover:bg-white/12 hover:ring-white/35"
        }`}
      >
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${
            selected ? "bg-[#e60000] text-white" : "bg-white/12 text-white/80"
          }`}
        >
          <LucideIcon icon={selected ? Ticket : Plane} size={22} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="font-vodafone-exb text-sm text-white sm:text-base">
              {billet.from} → {billet.to}
            </span>
            <span className="shrink-0 font-vodafone-rg-bd text-sm text-white sm:text-base">
              {billet.price}
            </span>
          </span>
          <span className="mt-1 block font-vodafone-lt text-xs text-white/75 sm:text-sm">
            {billet.date} · {billet.time}
          </span>
          <span className="mt-0.5 block font-vodafone-rg-bd text-[10px] uppercase tracking-wide text-white/55 sm:text-[11px]">
            {billet.carrier}
          </span>
        </span>
      </button>
    </li>
  );
}
