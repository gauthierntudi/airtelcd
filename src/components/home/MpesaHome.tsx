"use client";

import { CreditCard, ShoppingBag } from "lucide-react";
import { ExperienceAccessModals } from "@/components/home/ExperienceAccessModals";
import { OrbitalCommunityLayout } from "@/components/home/OrbitalCommunityLayout";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { useExperienceAccess } from "@/hooks/use-experience-access";
import { MPESA_ORBITAL_HOME } from "@/lib/orbital-home";
import { MPESA_VISA_WELCOME_BONUS_USD, VODACOM_MARKET_NAME } from "@/lib/mpesa-visa/constants";

export function MpesaHome() {
  const access = useExperienceAccess();

  return (
    <>
      <OrbitalCommunityLayout theme={MPESA_ORBITAL_HOME}>
        <div className="mt-2 grid gap-3">
          <button
            type="button"
            onClick={() => void access.openMpesaExperience()}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-vodacom-red py-3.5 font-vodafone-rg-bd text-base text-white shadow-lg transition active:scale-[0.98]"
          >
            <LucideIcon icon={CreditCard} size={20} />
            Obtenir Carte Visa M-Pesa
          </button>
          <button
            type="button"
            onClick={() => void access.openMarketExperience()}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white py-3.5 font-vodafone-rg-bd text-base text-vodacom-black shadow-lg transition active:scale-[0.98]"
          >
            <LucideIcon icon={ShoppingBag} size={20} className="text-vodacom-red" />
            {VODACOM_MARKET_NAME}
          </button>
          <p className="text-center font-vodafone-lt text-xs text-white/55">
            Bonus de bienvenue {MPESA_VISA_WELCOME_BONUS_USD} USD sur la carte Visa
          </p>
        </div>
      </OrbitalCommunityLayout>

      <ExperienceAccessModals access={access} />
    </>
  );
}
