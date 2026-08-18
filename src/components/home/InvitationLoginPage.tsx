"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AirtelSplashLoader } from "@/components/home/AirtelSplashLoader";
import { InvitationAccessForm } from "@/components/home/InvitationAccessForm";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import {
  INVITATION_HERO_IMAGES,
  pickInvitationHeroImage,
} from "@/components/invitation/invitation-shared";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  destroyInvitationSession,
  fetchInvitationSessionRedirect,
} from "@/lib/invitation-access/client-session";

export function InvitationLoginPage() {
  const [sessionPath, setSessionPath] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [heroSrc, setHeroSrc] = useState(INVITATION_HERO_IMAGES[0]);

  useEffect(() => {
    setHeroSrc(pickInvitationHeroImage());
    let cancelled = false;
    const started = Date.now();
    fetchInvitationSessionRedirect().then((path) => {
      if (cancelled) return;
      const wait = Math.max(0, 1400 - (Date.now() - started));
      window.setTimeout(() => {
        if (cancelled) return;
        setSessionPath(path);
        setChecking(false);
      }, wait);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const showSplash = checking || authenticating;

  return (
    <div className="min-h-dvh bg-zinc-950 sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-8">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-hidden bg-black sm:min-h-[680px] sm:rounded-[2rem]">
        {showSplash && <AirtelSplashLoader />}
        <section className="relative min-h-[240px] flex-1">
          <Image
            src={heroSrc}
            alt=""
            fill
            priority
            sizes="(max-width: 512px) 100vw, 512px"
            className="object-cover object-[32%_18%]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-vodacom-red via-vodacom-red/20 to-black/25"
            aria-hidden
          />

          <header className="absolute inset-x-0 top-0 z-10 px-5 pt-[max(0.85rem,env(safe-area-inset-top))]">
            <VodacomLogo
              variant="color"
              height={48}
              priority
              className="brightness-0 invert"
            />
          </header>

          <div className="absolute inset-x-0 bottom-6 z-10 px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
              Invitation
            </p>
            <h1 className="mt-1.5 font-vodafone-exb text-[1.85rem] font-normal leading-[1.15] tracking-tight text-white">
              Votre invitation
              <span className="block">vous attend</span>
            </h1>
          </div>
        </section>

        <section className="shrink-0 bg-vodacom-red px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5">
          <div>
            {sessionPath ? (
              <div className="space-y-4">
                <p className="text-[15px] leading-relaxed text-white/80">
                  Une session est déjà ouverte sur cet appareil.
                </p>
                <a
                  href={sessionPath}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-[17px] font-semibold text-vodacom-red"
                >
                  Voir mon invitation
                  <LucideIcon icon={ArrowRight} size={18} />
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    await destroyInvitationSession();
                    setSessionPath(null);
                  }}
                  className="w-full py-2 text-center text-sm text-white/70"
                >
                  Utiliser un autre contact
                </button>
              </div>
            ) : (
              <InvitationAccessForm
                postAuth="invitation"
                size="lg"
                tone="onRed"
                autoFocus={false}
                onBusyChange={setAuthenticating}
                submitLabel="Voir mon invitation"
                hint="Saisissez le mobile ou l’e-mail enregistré pour votre invitation."
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
