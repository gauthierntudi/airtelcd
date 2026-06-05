import type { MpesaVisaExperienceState } from "@/lib/mpesa-visa/service";
import type {
  UssdScreenId,
  VisaSimulationState,
} from "@/lib/mpesa-ussd/visa-simulation";
import { INITIAL_VISA_SIM_STATE } from "@/lib/mpesa-ussd/visa-simulation";

export function experienceToSimulationState(
  experience: MpesaVisaExperienceState,
  screen?: UssdScreenId,
): VisaSimulationState {
  const hasCard = Boolean(experience.card);
  const defaultScreen: UssdScreenId = hasCard ? "visa_main" : "root";
  return {
    ...INITIAL_VISA_SIM_STATE,
    screen: screen ?? defaultScreen,
    hasCard,
    cardBlocked: experience.card?.blocked ?? false,
    bonusBalanceUsd: experience.card?.bonusBalanceUsd ?? 0,
    cardMasked: experience.card?.cardMasked ?? null,
    cardPan: experience.card?.cardPanFormatted ?? null,
    cardExpiry: experience.card?.expiryDisplay ?? null,
    cardCvv: experience.card?.cvvDisplay ?? null,
    purchaseHistory: experience.purchases.map(
      (p) => `${p.productName} — ${p.priceUsd} USD`,
    ),
    visaCardEverIssued: experience.visaCardEverIssued,
  };
}
