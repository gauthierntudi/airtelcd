"use client";

import { ArrowLeftRight, CreditCard, Phone, Wifi } from "lucide-react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import type { ForfaitBenefit } from "@/lib/privilege-onboarding";

const PURCHASED_ICONS = {
  data: Wifi,
  appels: Phone,
  transfert: ArrowLeftRight,
  visa: CreditCard,
} as const;

const SIZE_CLASS = {
  md: "h-[5rem] w-[5rem] sm:h-[5.5rem] sm:w-[5.5rem]",
  lg: "h-[8.75rem] w-[8.75rem] sm:h-[9.75rem] sm:w-[9.75rem]",
} as const;

type Props = {
  benefit: ForfaitBenefit;
  index: number;
  size?: keyof typeof SIZE_CLASS;
  animate?: boolean;
  pop?: boolean;
  active?: boolean;
};

export function PurchasedForfaitBenefitCircle({
  benefit,
  index,
  size = "md",
  animate = true,
  pop = false,
  active = true,
}: Props) {
  const Icon = PURCHASED_ICONS[benefit.id as keyof typeof PURCHASED_ICONS];
  const isLarge = size === "lg";
  const shouldAnimate = active && animate;

  return (
    <div
      className={shouldAnimate ? "forfait-inner-orbit-float" : undefined}
      style={
        shouldAnimate
          ? {
              animationDelay: `${(index % 4) * 0.85}s`,
              animationDuration: `${3.8 + (index % 4) * 0.35}s`,
            }
          : undefined
      }
    >
      <div
        className={`flex flex-col items-center justify-center rounded-full p-2 text-center transition duration-300 ${SIZE_CLASS[size]} ${
          active
            ? "ring-[3px] ring-white/70"
            : "ring-2 ring-white/20 opacity-70 grayscale"
        } ${pop ? "forfait-benefit-pop" : ""}`}
        style={{
          backgroundColor: active ? benefit.color : "#5a5f64",
          animationDelay: pop ? `${index * 40}ms` : undefined,
          boxShadow: active
            ? `0 10px 28px ${benefit.color}66, 0 4px 12px rgba(0,0,0,0.28)`
            : "0 4px 14px rgba(0,0,0,0.22)",
        }}
      >
        {Icon ? (
          <LucideIcon
            icon={Icon}
            size={isLarge ? 28 : 22}
            className="shrink-0 drop-shadow-sm"
          />
        ) : null}
        <span className="mt-1 max-w-[94%] font-vodafone-exb text-[9px] uppercase leading-tight tracking-[0.1em] text-white/90 sm:text-[10px]">
          {benefit.label}
        </span>
        {benefit.value ? (
          <span
            className={`mt-0.5 max-w-[94%] font-vodafone-exb font-normal leading-none text-white ${
              isLarge ? "text-[1.05rem] sm:text-xl" : "text-sm sm:text-base"
            }`}
          >
            {benefit.value}
          </span>
        ) : null}
      </div>
    </div>
  );
}
