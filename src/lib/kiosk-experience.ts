/** Indicateurs d'un parcours kiosque en cours (Traveler, Business, M-Pesa). */
export type KioskExperienceFlags = {
  travelerJourneyOpen: boolean;
  businessSharingIntroOpen: boolean;
  businessSharingUssdOpen: boolean;
  businessConnectivityOpen: boolean;
  businessP2pOpen: boolean;
  mpesaOpen: boolean;
  marketOpen: boolean;
};

export function isKioskExperienceActive(flags: KioskExperienceFlags): boolean {
  return (
    flags.travelerJourneyOpen ||
    flags.businessSharingIntroOpen ||
    flags.businessSharingUssdOpen ||
    flags.businessConnectivityOpen ||
    flags.businessP2pOpen ||
    flags.mpesaOpen ||
    flags.marketOpen
  );
}
