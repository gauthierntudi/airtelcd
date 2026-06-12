"use client";

import { PRIVILEGE_PURCHASED_FORFAIT_BENEFITS } from "@/lib/privilege-onboarding";
import { PurchasedForfaitBenefitCircle } from "@/components/privilege/PurchasedForfaitBenefitCircle";

type Props = {
  className?: string;
  /** Si défini, seuls ces cercles restent actifs (couleur) ; les autres sont grisés */
  activeBenefitIds?: string[];
};

export function PurchasedForfaitVerticalStack({
  className,
  activeBenefitIds,
}: Props) {
  return (
    <aside className={className} aria-label="Votre forfait Privilège">
      <ul className="flex flex-col items-center gap-2.5 sm:gap-3">
        {PRIVILEGE_PURCHASED_FORFAIT_BENEFITS.map((benefit, index) => (
          <li key={benefit.id}>
            <PurchasedForfaitBenefitCircle
              benefit={benefit}
              index={index}
              size="md"
              active={
                activeBenefitIds
                  ? activeBenefitIds.includes(benefit.id)
                  : true
              }
            />
          </li>
        ))}
      </ul>
    </aside>
  );
}
