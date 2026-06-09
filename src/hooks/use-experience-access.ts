"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchInvitationSessionRedirect } from "@/lib/invitation-access/client-session";
import type { InvitationAccessPostAuth } from "@/lib/invitation-access/types";
import {
  fetchMpesaVisaState,
  peekMpesaVisaCache,
} from "@/lib/mpesa-visa/client";
import type { MpesaVisaExperienceState } from "@/lib/mpesa-visa/service";
import type { ExperienceProfile } from "@/lib/experience-profile";
import { saveExperienceProfile } from "@/lib/experience-profile";
import { notify } from "@/lib/toast";

export function useExperienceAccess() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [accessPostAuth, setAccessPostAuth] =
    useState<InvitationAccessPostAuth>("invitation");
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [privilegeUssdOpen, setPrivilegeUssdOpen] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [mpesaExperience, setMpesaExperience] =
    useState<MpesaVisaExperienceState | null>(null);

  const openAccessModal = useCallback((intent: InvitationAccessPostAuth) => {
    setAccessPostAuth(intent);
    setAccessOpen(true);
  }, []);

  const handleAccessAuthenticated = useCallback(
    async (intent: Exclude<InvitationAccessPostAuth, "invitation">) => {
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

  const openInvitationAccess = useCallback(() => {
    setProfileOpen(true);
  }, []);

  const continueInvitationAfterProfile = useCallback(
    async (profile: ExperienceProfile) => {
      saveExperienceProfile(profile);
      setProfileOpen(false);

      if (profile === "BUSINESS") {
        setPrivilegeUssdOpen(true);
        return;
      }

      setSessionLoading(true);
      try {
        const redirectPath = await fetchInvitationSessionRedirect();
        if (redirectPath) {
          window.location.href = redirectPath;
          return;
        }
        openAccessModal("invitation");
      } finally {
        setSessionLoading(false);
      }
    },
    [openAccessModal],
  );

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
    sessionLoading,
    mpesaExperience,
    setMpesaExperience,
    openAccessModal,
    handleAccessAuthenticated,
    openInvitationAccess,
    continueInvitationAfterProfile,
    openMpesaExperience,
    openMarketExperience,
  };
}
