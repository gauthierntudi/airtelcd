"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchInvitationSessionRedirect } from "@/lib/invitation-access/client-session";
import { endExperienceSession } from "@/lib/invitation-access/end-session";
import type { InvitationAccessPostAuth } from "@/lib/invitation-access/types";
import {
  fetchMpesaVisaState,
  invalidateMpesaVisaCache,
  peekMpesaVisaCache,
} from "@/lib/mpesa-visa/client";
import type { MpesaVisaExperienceState } from "@/lib/mpesa-visa/service";
import type { ExperienceProfile } from "@/lib/experience-profile";
import { saveExperienceProfile } from "@/lib/experience-profile";
import {
  isKioskExperienceActive,
  type KioskExperienceFlags,
} from "@/lib/kiosk-experience";
import { notify } from "@/lib/toast";

export function useExperienceAccess() {
  const [dialerOpen, setDialerOpen] = useState(false);
  const [optInUssdOpen, setOptInUssdOpen] = useState(false);
  const [forfaitActivationOpen, setForfaitActivationOpen] = useState(false);
  const [forfaitPurchasedOpen, setForfaitPurchasedOpen] = useState(false);
  const [privilegeForfaitPurchased, setPrivilegeForfaitPurchased] =
    useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [travelerJourneyOpen, setTravelerJourneyOpen] = useState(false);
  const [travelerStep, setTravelerStep] = useState(1);
  const [businessSharingIntroOpen, setBusinessSharingIntroOpen] =
    useState(false);
  const [businessSharingUssdOpen, setBusinessSharingUssdOpen] = useState(false);
  const [businessConnectivityOpen, setBusinessConnectivityOpen] =
    useState(false);
  const [businessP2pOpen, setBusinessP2pOpen] = useState(false);
  const [businessMemberNumber, setBusinessMemberNumber] = useState<
    string | null
  >(null);
  const [accessOpen, setAccessOpen] = useState(false);
  const [accessPostAuth, setAccessPostAuth] =
    useState<InvitationAccessPostAuth>("invitation");
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [privilegeUssdOpen, setPrivilegeUssdOpen] = useState(false);
  const [forfaitActivationLoading, setForfaitActivationLoading] =
    useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [mpesaExperience, setMpesaExperience] =
    useState<MpesaVisaExperienceState | null>(null);

  const kioskExperienceFlags = useCallback(
    (): KioskExperienceFlags => ({
      travelerJourneyOpen,
      businessSharingIntroOpen,
      businessSharingUssdOpen,
      businessConnectivityOpen,
      businessP2pOpen,
      mpesaOpen,
      marketOpen,
    }),
    [
      travelerJourneyOpen,
      businessSharingIntroOpen,
      businessSharingUssdOpen,
      businessConnectivityOpen,
      businessP2pOpen,
      mpesaOpen,
      marketOpen,
    ],
  );

  const isExperienceActive = useCallback(
    () => isKioskExperienceActive(kioskExperienceFlags()),
    [kioskExperienceFlags],
  );

  const openAccessModal = useCallback(
    (intent: InvitationAccessPostAuth) => {
      if (intent === "invitation" && isExperienceActive()) return;
      setAccessPostAuth(intent);
      setAccessOpen(true);
    },
    [isExperienceActive],
  );

  const handleAccessAuthenticated = useCallback(
    async (intent: Exclude<InvitationAccessPostAuth, "invitation">) => {
      if (intent === "privilege") {
        setDialerOpen(true);
        return;
      }
      try {
        const state = await fetchMpesaVisaState();
        if (intent === "market") {
          setMarketOpen(true);
          return;
        }
        setMpesaExperience(state);
        setMpesaOpen(true);
      } catch (err) {
        notify.error(
          err instanceof Error ? err.message : "Impossible d'ouvrir l'expérience",
        );
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (peekMpesaVisaCache()) return;
      const redirectPath = await fetchInvitationSessionRedirect();
      if (!redirectPath || cancelled) return;
      try {
        await fetchMpesaVisaState();
      } catch {
        /* session expirée — ignoré */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openInvitationModule = useCallback(async () => {
    if (isExperienceActive()) return;
    setSessionLoading(true);
    try {
      const redirectPath = await fetchInvitationSessionRedirect();
      if (redirectPath) {
        window.location.href = redirectPath;
        return;
      }
      openAccessModal("invitation");
    } catch {
      openAccessModal("invitation");
    } finally {
      setSessionLoading(false);
    }
  }, [isExperienceActive, openAccessModal]);

  /** Bouton hero Privilège — identification avant le dialer. */
  const openInvitationAccess = useCallback(() => {
    openAccessModal("privilege");
  }, [openAccessModal]);

  const handlePrivilegeDialMatched = useCallback(() => {
    setDialerOpen(false);
    setOptInUssdOpen(true);
  }, []);

  const handlePrivilegeOptInCancel = useCallback(() => {
    setOptInUssdOpen(false);
  }, []);

  const handlePrivilegeOptInConfirmed = useCallback(() => {
    setOptInUssdOpen(false);
    setForfaitActivationOpen(true);
  }, []);

  const handleForfaitActivationContinue = useCallback(() => {
    setForfaitActivationOpen(false);
    setPrivilegeUssdOpen(true);
  }, []);

  const handlePrivilegeForfaitPurchased = useCallback(async () => {
    setForfaitActivationLoading(true);
    setPrivilegeUssdOpen(false);

    const minLoaderMs = 1400;
    const startedAt = Date.now();

    try {
      const res = await fetch("/api/privilege/forfait-activated", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as {
        error?: string;
        state?: MpesaVisaExperienceState | null;
      };
      if (!res.ok) {
        if (res.status === 401) {
          openAccessModal("privilege");
          return;
        }
        throw new Error(data.error ?? "Activation du forfait impossible.");
      }
      invalidateMpesaVisaCache();
      if (data.state) {
        await fetchMpesaVisaState({ force: true });
      }

      const remaining = minLoaderMs - (Date.now() - startedAt);
      if (remaining > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remaining));
      }

      setPrivilegeForfaitPurchased(true);
      setForfaitPurchasedOpen(true);
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : "Activation du forfait impossible.",
      );
    } finally {
      setForfaitActivationLoading(false);
    }
  }, [openAccessModal]);

  const handleForfaitPurchasedContinue = useCallback(() => {
    setForfaitPurchasedOpen(false);
    setProfileOpen(true);
  }, []);

  const resetLocalExperienceState = useCallback(() => {
    setPrivilegeForfaitPurchased(false);
    setTravelerStep(1);
    setBusinessMemberNumber(null);
    setMpesaExperience(null);
  }, []);

  /** Fin d'expérience : session + état local, sans redirection. */
  const completeExperience = useCallback(async () => {
    setSessionLoading(true);
    try {
      await endExperienceSession();
      resetLocalExperienceState();
    } finally {
      setSessionLoading(false);
    }
  }, [resetLocalExperienceState]);

  const endMpesaExperience = useCallback(async () => {
    setMpesaOpen(false);
    setMpesaExperience(null);
    await completeExperience();
  }, [completeExperience]);

  const endMarketExperience = useCallback(async () => {
    setMarketOpen(false);
    await completeExperience();
  }, [completeExperience]);

  const handleBusinessConnectivityContinue = useCallback(() => {
    setBusinessConnectivityOpen(false);
    setBusinessP2pOpen(true);
  }, []);

  const handleBusinessP2pComplete = useCallback(async () => {
    setBusinessP2pOpen(false);
    setBusinessMemberNumber(null);
    await completeExperience();
  }, [completeExperience]);

  const continueInvitationAfterProfile = useCallback(
    async (profile: ExperienceProfile) => {
      saveExperienceProfile(profile);
      setProfileOpen(false);

      if (profile === "TRAVELER" && privilegeForfaitPurchased) {
        setTravelerStep(1);
        setTravelerJourneyOpen(true);
        return;
      }

      if (profile === "BUSINESS" && privilegeForfaitPurchased) {
        setBusinessSharingIntroOpen(true);
        return;
      }

      if (profile === "BUSINESS" && !privilegeForfaitPurchased) {
        setPrivilegeUssdOpen(true);
        return;
      }

      if (profile === "TRAVELER" && !privilegeForfaitPurchased) {
        setPrivilegeUssdOpen(true);
      }
    },
    [privilegeForfaitPurchased],
  );

  const handleTravelerJourneyContinue = useCallback(async () => {
    if (travelerStep < 5) {
      setTravelerStep((step) => step + 1);
      return;
    }

    setTravelerJourneyOpen(false);
    setTravelerStep(1);
    await completeExperience();
  }, [completeExperience, travelerStep]);

  const openMpesaExperience = useCallback(async () => {
    const hasSession = await fetchInvitationSessionRedirect();
    if (!hasSession) {
      openAccessModal("mpesa");
      return;
    }
    try {
      const state = peekMpesaVisaCache() ?? (await fetchMpesaVisaState());
      setMpesaExperience(state);
      setMpesaOpen(true);
    } catch {
      openAccessModal("mpesa");
    }
  }, [openAccessModal]);

  const openMarketExperience = useCallback(async () => {
    const hasSession = await fetchInvitationSessionRedirect();
    if (!hasSession) {
      openAccessModal("market");
      return;
    }
    try {
      await fetchMpesaVisaState();
      setMarketOpen(true);
    } catch {
      openAccessModal("market");
    }
  }, [openAccessModal]);

  return {
    dialerOpen,
    setDialerOpen,
    optInUssdOpen,
    setOptInUssdOpen,
    forfaitActivationOpen,
    setForfaitActivationOpen,
    handlePrivilegeDialMatched,
    handlePrivilegeOptInCancel,
    handlePrivilegeOptInConfirmed,
    handleForfaitActivationContinue,
    forfaitPurchasedOpen,
    setForfaitPurchasedOpen,
    handlePrivilegeForfaitPurchased,
    handleForfaitPurchasedContinue,
    privilegeForfaitPurchased,
    travelerJourneyOpen,
    setTravelerJourneyOpen,
    travelerStep,
    setTravelerStep,
    handleTravelerJourneyContinue,
    businessSharingIntroOpen,
    setBusinessSharingIntroOpen,
    businessSharingUssdOpen,
    setBusinessSharingUssdOpen,
    businessConnectivityOpen,
    setBusinessConnectivityOpen,
    businessP2pOpen,
    setBusinessP2pOpen,
    handleBusinessConnectivityContinue,
    handleBusinessP2pComplete,
    businessMemberNumber,
    setBusinessMemberNumber,
    profileOpen,
    setProfileOpen,
    accessOpen,
    setAccessOpen,
    accessPostAuth,
    mpesaOpen,
    setMpesaOpen,
    marketOpen,
    setMarketOpen,
    privilegeUssdOpen,
    setPrivilegeUssdOpen,
    forfaitActivationLoading,
    sessionLoading,
    mpesaExperience,
    setMpesaExperience,
    openAccessModal,
    handleAccessAuthenticated,
    openInvitationAccess,
    openInvitationModule,
    continueInvitationAfterProfile,
    openMpesaExperience,
    openMarketExperience,
    endMpesaExperience,
    endMarketExperience,
    isExperienceActive,
    kioskExperienceFlags,
  };
}
