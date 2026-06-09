"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ExperienceAccessModals } from "@/components/home/ExperienceAccessModals";
import { ExperienceCardsSection } from "@/components/home/ExperienceCardsSection";
import { OrbitalCommunityLayout } from "@/components/home/OrbitalCommunityLayout";
import { WelcomeHashtagLoader } from "@/components/invitation/WelcomeHashtagLoader";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { useExperienceAccess } from "@/hooks/use-experience-access";
import { EVENT } from "@/lib/event";
import { PRIVILEGE_ORBITAL_HOME } from "@/lib/orbital-home";

export function PrivilegeHome() {
  const [welcomeLoaderDone, setWelcomeLoaderDone] = useState(false);
  const access = useExperienceAccess();

  return (
    <>
      {!welcomeLoaderDone && (
        <WelcomeHashtagLoader onDone={() => setWelcomeLoaderDone(true)} />
      )}
      <OrbitalCommunityLayout theme={PRIVILEGE_ORBITAL_HOME}>
        <div className="mt-2 space-y-3">
          <button
            type="button"
            onClick={access.openInvitationAccess}
            disabled={access.sessionLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 font-vodafone-rg-bd text-base text-vodacom-red shadow-lg transition active:scale-[0.98] disabled:opacity-60"
          >
            {access.sessionLoading && (
              <LucideIcon icon={Loader2} size={20} className="animate-spin" />
            )}
            {access.sessionLoading ? "Ouverture…" : "Commencez l'expérience"}
          </button>
          <p className="text-center font-vodafone-lt text-xs text-white/55">
            SMS ou e-mail enregistré pour votre invitation
          </p>
        </div>
      </OrbitalCommunityLayout>

      <section className="bg-vodacom-cream px-4 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <p className="font-vodafone-rg-bd text-xs uppercase tracking-[0.2em] text-vodacom-red">
            Parcours
          </p>
          <h2 className="mt-1 font-vodafone-exb text-2xl font-normal text-vodacom-black sm:text-3xl">
            Expériences & activités
          </h2>
          <ExperienceCardsSection access={access} />
        </div>
      </section>

      <footer className="border-t border-vodacom-silver/25 bg-white px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8">
        <p className="mx-auto max-w-6xl text-center font-vodafone-lt text-[11px] leading-relaxed text-vodacom-black/50 sm:text-xs">
          © {new Date().getFullYear()} {EVENT.organizer} — {EVENT.contactEmail}
        </p>
      </footer>

      <ExperienceAccessModals access={access} />
    </>
  );
}
