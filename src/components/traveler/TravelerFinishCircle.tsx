"use client";

import {
  Globe,
  MessageSquare,
  Phone,
  Plane,
  Plus,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { PurchasedForfaitBenefitCircle } from "@/components/privilege/PurchasedForfaitBenefitCircle";
import { LucideIcon } from "@/components/ui/lucide-icon";
import type { ForfaitBenefit } from "@/lib/privilege-onboarding";
import type { FinishCircleKind } from "@/lib/traveler-finish-physics";

const PRIVILEGE_ICONS = {
  appels: Phone,
  sms: MessageSquare,
  internet: Zap,
  club: Sparkles,
  "forfaits-plus": Plus,
  roaming: Plane,
  "appels-intl": Globe,
  convertibilite: RefreshCw,
  flexibilite: Sparkles,
} as const;

type Props = {
  benefit: ForfaitBenefit;
  kind: FinishCircleKind;
  index: number;
  sizePx: number;
  pauseFloat?: boolean;
};

export function TravelerFinishCircle({
  benefit,
  kind,
  index,
  sizePx,
  pauseFloat = false,
}: Props) {
  if (kind === "purchased") {
    const baseSize = 80;
    const scale = sizePx / baseSize;

    return (
      <div
        className="flex items-center justify-center"
        style={{ width: sizePx, height: sizePx }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
          <PurchasedForfaitBenefitCircle
            benefit={benefit}
            index={index}
            size="md"
            active
            animate={!pauseFloat}
          />
        </div>
      </div>
    );
  }

  const Icon = PRIVILEGE_ICONS[benefit.id as keyof typeof PRIVILEGE_ICONS];
  const fontSize =
    sizePx < 64 ? 7 : sizePx < 76 ? 8 : sizePx < 88 ? 9 : sizePx < 98 ? 10 : 11;
  const iconSize =
    sizePx < 64 ? 16 : sizePx < 76 ? 18 : sizePx < 88 ? 20 : sizePx < 98 ? 22 : 24;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-full p-1.5 text-center ring-2 ring-white/50 ${
        pauseFloat ? "" : "forfait-inner-orbit-float"
      }`}
      style={{
        width: sizePx,
        height: sizePx,
        backgroundColor: benefit.color,
        boxShadow: `0 8px 22px ${benefit.color}55`,
        animationDelay: pauseFloat ? undefined : `${(index % 4) * 0.7}s`,
        animationDuration: pauseFloat ? undefined : `${3.6 + (index % 3) * 0.4}s`,
      }}
    >
      {Icon ? (
        <LucideIcon icon={Icon} size={iconSize} className="text-white" />
      ) : null}
      <span
        className="mt-0.5 max-w-[94%] font-vodafone-exb uppercase leading-tight tracking-[0.08em] text-white"
        style={{ fontSize }}
      >
        {benefit.label}
      </span>
    </div>
  );
}
