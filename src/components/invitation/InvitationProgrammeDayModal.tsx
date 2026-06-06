"use client";

import { X } from "lucide-react";
import { ProgrammeDayContent } from "@/components/invitation/ProgrammeDayContent";
import { InvitationBottomSheet } from "@/components/invitation/InvitationBottomSheet";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { getProgrammeForDay } from "@/lib/event-programmes";
import { getEventDayById, type EventDayId } from "@/lib/event-days";

type Props = {
  dayId: EventDayId;
  onClose: () => void;
};

/** Bottom sheet — programme du jour (slide Programme mobile) */
export function InvitationProgrammeDayModal({ dayId, onClose }: Props) {
  const day = getEventDayById(dayId);
  const programme = getProgrammeForDay(dayId);

  return (
    <InvitationBottomSheet
      onClose={onClose}
      titleId="programme-day-title"
      backdropLabel="Fermer le programme"
    >
      <header className="shrink-0 px-5 pb-4 pt-0">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-vodacom-red text-white shadow-lg shadow-vodacom-red/30"
            aria-hidden
          >
            <span className="font-vodafone-exb text-2xl leading-none">
              {day.pillLabel}
            </span>
            <span className="mt-0.5 font-vodafone-rg-bd text-[9px] font-normal uppercase tracking-wide">
              juin
            </span>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-vodacom-red">
              Jour {day.day} · {day.label}
            </p>
            <h2
              id="programme-day-title"
              className="font-vodafone-exb text-[1.35rem] leading-tight tracking-tight text-white"
            >
              {programme.title}
            </h2>
            <p className="mt-1 font-vodafone-rg-bd text-sm text-vodacom-red/90">
              {programme.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
          >
            <LucideIcon icon={X} size={20} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
        <ProgrammeDayContent programme={programme} variant="sheet" />
      </div>

      <div className="shrink-0 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        <button
          type="button"
          onClick={onClose}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-white text-base font-bold text-vodacom-red active:scale-[0.98]"
        >
          Fermer
        </button>
      </div>
    </InvitationBottomSheet>
  );
}
