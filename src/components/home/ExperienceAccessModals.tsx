"use client";

import { PrivilegeDialerModal } from "@/components/home/PrivilegeDialerModal";
import { PrivilegeForfaitActivationModal } from "@/components/home/PrivilegeForfaitActivationModal";
import { PrivilegeOptInUssdModal } from "@/components/home/PrivilegeOptInUssdModal";
import { ExperienceProfileModal } from "@/components/home/ExperienceProfileModal";
import { InvitationAccessModal } from "@/components/home/InvitationAccessModal";
import { MpesaVisaUssdModal } from "@/components/home/MpesaVisaUssdModal";
import { PrivilegeUssdModal } from "@/components/home/PrivilegeUssdModal";
import { BusinessConnectivityScreen } from "@/components/business/BusinessConnectivityScreen";
import { BusinessP2pTransferScreen } from "@/components/business/BusinessP2pTransferScreen";
import { BusinessSharingIntroModal } from "@/components/business/BusinessSharingIntroModal";
import { BusinessSharingUssdModal } from "@/components/business/BusinessSharingUssdModal";
import { PrivilegeForfaitActivationLoader } from "@/components/privilege/PrivilegeForfaitActivationLoader";
import { TravelerJourneyModal } from "@/components/traveler/TravelerJourneyModal";
import { VodacomMarketModal } from "@/components/vodacom-market/VodacomMarketModal";
import { useExperienceAccess } from "@/hooks/use-experience-access";
import { isKioskExperienceActive } from "@/lib/kiosk-experience";

type AccessState = ReturnType<typeof useExperienceAccess>;

export function ExperienceAccessModals({
  access,
}: {
  access: AccessState;
}) {
  const blockInvitationRedirect = isKioskExperienceActive(
    access.kioskExperienceFlags(),
  );

  return (
    <>
      <PrivilegeDialerModal
        open={access.dialerOpen}
        onClose={() => access.setDialerOpen(false)}
        onCodeMatched={access.handlePrivilegeDialMatched}
      />
      <PrivilegeOptInUssdModal
        open={access.optInUssdOpen}
        onClose={() => access.setOptInUssdOpen(false)}
        onCancel={access.handlePrivilegeOptInCancel}
        onConfirmed={access.handlePrivilegeOptInConfirmed}
      />
      <PrivilegeForfaitActivationModal
        open={access.forfaitActivationOpen}
        onClose={() => access.setForfaitActivationOpen(false)}
        onContinue={access.handleForfaitActivationContinue}
        mode="activation"
      />
      <PrivilegeForfaitActivationModal
        open={access.forfaitPurchasedOpen}
        onClose={() => access.setForfaitPurchasedOpen(false)}
        onContinue={access.handleForfaitPurchasedContinue}
        mode="purchased"
      />
      <ExperienceProfileModal
        open={access.profileOpen}
        onClose={() => access.setProfileOpen(false)}
        onSelect={(profile) => void access.continueInvitationAfterProfile(profile)}
        showPurchasedForfait={access.privilegeForfaitPurchased}
      />
      <TravelerJourneyModal
        open={access.travelerJourneyOpen}
        step={access.travelerStep}
        onClose={() => {
          access.setTravelerJourneyOpen(false);
          access.setTravelerStep(1);
        }}
        onContinue={() => void access.handleTravelerJourneyContinue()}
        continuing={access.sessionLoading}
        onAuthRequired={() => access.openAccessModal("privilege")}
      />
      <PrivilegeForfaitActivationLoader open={access.forfaitActivationLoading} />
      <BusinessSharingIntroModal
        open={access.businessSharingIntroOpen}
        onClose={() => access.setBusinessSharingIntroOpen(false)}
        onContinue={() => {
          access.setBusinessSharingIntroOpen(false);
          access.setBusinessSharingUssdOpen(true);
        }}
      />
      <BusinessSharingUssdModal
        open={access.businessSharingUssdOpen}
        onClose={() => access.setBusinessSharingUssdOpen(false)}
        onComplete={(memberNumber) => {
          access.setBusinessSharingUssdOpen(false);
          access.setBusinessMemberNumber(memberNumber);
          access.setBusinessConnectivityOpen(true);
        }}
      />
      {access.businessMemberNumber ? (
        <>
          <BusinessConnectivityScreen
            open={access.businessConnectivityOpen}
            memberNumber={access.businessMemberNumber}
            onClose={() => {
              access.setBusinessConnectivityOpen(false);
              access.setBusinessMemberNumber(null);
            }}
            onContinue={access.handleBusinessConnectivityContinue}
          />
          <BusinessP2pTransferScreen
            open={access.businessP2pOpen}
            memberNumber={access.businessMemberNumber}
            onClose={() => {
              access.setBusinessP2pOpen(false);
              access.setBusinessMemberNumber(null);
            }}
            onComplete={() => void access.handleBusinessP2pComplete()}
          />
        </>
      ) : null}
      <InvitationAccessModal
        open={access.accessOpen}
        onClose={() => access.setAccessOpen(false)}
        postAuth={access.accessPostAuth}
        onAuthenticated={access.handleAccessAuthenticated}
        blockInvitationRedirect={blockInvitationRedirect}
      />
      <PrivilegeUssdModal
        open={access.privilegeUssdOpen}
        onClose={() => access.setPrivilegeUssdOpen(false)}
        onPurchaseComplete={() => void access.handlePrivilegeForfaitPurchased()}
      />
      <MpesaVisaUssdModal
        open={access.mpesaOpen}
        initialExperience={access.mpesaExperience}
        onClose={() => void access.endMpesaExperience()}
        onAuthRequired={() => {
          access.setMpesaOpen(false);
          access.setMpesaExperience(null);
          access.openAccessModal("mpesa");
        }}
      />
      <VodacomMarketModal
        open={access.marketOpen}
        onClose={() => access.endMarketExperience()}
        onAuthRequired={() => {
          void access.endMarketExperience().then(() => access.openAccessModal("market"));
        }}
        onRequestVisaCard={() => {
          void access.endMarketExperience().then(() => access.openMpesaExperience());
        }}
      />
    </>
  );
}
