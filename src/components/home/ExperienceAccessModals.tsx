"use client";

import { ExperienceProfileModal } from "@/components/home/ExperienceProfileModal";
import { InvitationAccessModal } from "@/components/home/InvitationAccessModal";
import { MpesaVisaUssdModal } from "@/components/home/MpesaVisaUssdModal";
import { PrivilegeUssdModal } from "@/components/home/PrivilegeUssdModal";
import { VodacomMarketModal } from "@/components/vodacom-market/VodacomMarketModal";
import { useExperienceAccess } from "@/hooks/use-experience-access";

type AccessState = ReturnType<typeof useExperienceAccess>;

export function ExperienceAccessModals({
  access,
}: {
  access: AccessState;
}) {
  return (
    <>
      <ExperienceProfileModal
        open={access.profileOpen}
        onClose={() => access.setProfileOpen(false)}
        onSelect={(profile) => void access.continueInvitationAfterProfile(profile)}
      />
      <InvitationAccessModal
        open={access.accessOpen}
        onClose={() => access.setAccessOpen(false)}
        postAuth={access.accessPostAuth}
        onAuthenticated={access.handleAccessAuthenticated}
      />
      <PrivilegeUssdModal
        open={access.privilegeUssdOpen}
        onClose={() => access.setPrivilegeUssdOpen(false)}
      />
      <MpesaVisaUssdModal
        open={access.mpesaOpen}
        initialExperience={access.mpesaExperience}
        onClose={() => {
          access.setMpesaOpen(false);
          access.setMpesaExperience(null);
        }}
        onAuthRequired={() => {
          access.setMpesaOpen(false);
          access.setMpesaExperience(null);
          access.openAccessModal("mpesa");
        }}
      />
      <VodacomMarketModal
        open={access.marketOpen}
        onClose={() => access.setMarketOpen(false)}
        onAuthRequired={() => {
          access.setMarketOpen(false);
          access.openAccessModal("market");
        }}
        onRequestVisaCard={() => {
          access.setMarketOpen(false);
          access.openMpesaExperience();
        }}
      />
    </>
  );
}
