"use client";

import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  TRAVELER_JOURNEY_STEPS,
  type TravelerJourneyStep,
} from "@/lib/traveler-journey";

type Props = {
  currentStep: number;
};

export function TravelerProgressBar({ currentStep }: Props) {
  return (
    <nav
      className="w-full max-w-lg px-2 sm:max-w-xl"
      aria-label="Progression du parcours Traveler"
    >
      <ol className="relative flex items-start justify-between">
        <div
          className="pointer-events-none absolute left-[10%] right-[10%] top-[1.35rem] h-0.5 bg-white/20 sm:top-[1.5rem]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-[10%] top-[1.35rem] h-0.5 bg-[#e60000] transition-all duration-500 sm:top-[1.5rem]"
          style={{
            width: `${Math.max(0, ((currentStep - 1) / (TRAVELER_JOURNEY_STEPS.length - 1)) * 80)}%`,
          }}
          aria-hidden
        />

        {TRAVELER_JOURNEY_STEPS.map((step) => (
          <TravelerProgressNode
            key={step.id}
            step={step}
            state={
              step.index < currentStep
                ? "done"
                : step.index === currentStep
                  ? "current"
                  : "upcoming"
            }
          />
        ))}
      </ol>
    </nav>
  );
}

function TravelerProgressNode({
  step,
  state,
}: {
  step: TravelerJourneyStep;
  state: "done" | "current" | "upcoming";
}) {
  const isCurrent = state === "current";
  const isDone = state === "done";

  return (
    <li className="relative z-10 flex w-[18%] flex-col items-center gap-1.5 text-center">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ring-2 transition duration-300 sm:h-12 sm:w-12 ${
          isCurrent
            ? "bg-[#e60000] text-white ring-white shadow-[0_4px_16px_rgba(230,0,0,0.45)]"
            : isDone
              ? "bg-white text-[#e60000] ring-white/80"
              : "bg-white/10 text-white/45 ring-white/20"
        }`}
      >
        <LucideIcon icon={step.icon} size={isCurrent ? 22 : 20} />
      </span>
      <span
        className={`font-vodafone-rg-bd text-[9px] uppercase leading-tight tracking-wide sm:text-[10px] ${
          isCurrent ? "text-white" : isDone ? "text-white/85" : "text-white/45"
        }`}
      >
        {step.label}
      </span>
    </li>
  );
}
