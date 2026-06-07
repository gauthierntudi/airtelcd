"use client";

import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ExperienceCardsSection } from "@/components/home/ExperienceCardsSection";
import { WelcomeHashtagLoader } from "@/components/invitation/WelcomeHashtagLoader";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { EVENT } from "@/lib/event";
import {
  INVITATION_CLIENT_IMAGES,
  PLATFORM_ORGANIZER_BG_URL,
} from "@/lib/invitation-assets";

export function PlatformHome() {
  const [welcomeLoaderDone, setWelcomeLoaderDone] = useState(false);

  return (
    <>
      {!welcomeLoaderDone && (
        <WelcomeHashtagLoader onDone={() => setWelcomeLoaderDone(true)} />
      )}
      <div className="min-h-screen bg-vodacom-cream font-vodafone-lt text-vodacom-black">
      <section className="relative overflow-hidden bg-vodacom-black">
        <div className="relative min-h-[min(68vh,540px)] w-full sm:aspect-[21/9] sm:min-h-[280px] sm:max-h-[min(52vh,480px)]">
          <Image
            src={INVITATION_CLIENT_IMAGES.hero.src}
            alt={INVITATION_CLIENT_IMAGES.hero.alt}
            fill
            priority
            unoptimized
            className="object-cover object-[center_30%] sm:object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-vodacom-black via-vodacom-black/70 to-vodacom-black/30" />
        </div>

        <div className="absolute inset-0 flex flex-col">
          <div className="mx-auto w-full max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 sm:pt-5">
            <VodacomLogo variant="white" href="/" height={36} priority className="sm:hidden" />
            <VodacomLogo
              variant="white"
              href="/"
              height={44}
              priority
              className="hidden sm:block"
            />
          </div>

          <div className="mt-auto px-4 pb-8 pt-10 sm:px-8 sm:pb-12 sm:pt-16">
            <div className="mx-auto max-w-6xl">
              <p className="inline-flex rounded-full bg-vodacom-red px-3 py-1 text-[10px] font-bold text-white sm:py-1.5 sm:text-[11px]">
                {EVENT.title}
              </p>
              <h1 className="mt-3 font-vodafone-exb text-[1.65rem] font-normal leading-[1.1] tracking-tight text-white sm:mt-4 sm:text-4xl md:text-[2.75rem]">
                Le privilège se vit aussi sur le green
              </h1>
              <p className="mt-1.5 font-vodafone-rg-bd text-base text-vodacom-red sm:mt-2 sm:text-xl">
                Plus de flexibilité, plus de privilèges
              </p>
              <p className="mt-3 font-vodafone-lt text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-lg sm:text-white/85">
                Invitations VIP, expériences produit et activités enfants pour
                l&apos;événement golf.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-14">
        <div className="space-y-3 sm:flex sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:space-y-0">
          <div>
            <p className="font-vodafone-rg-bd text-xs uppercase tracking-[0.2em] text-vodacom-red">
              Plateforme
            </p>
            <h2 className="font-vodafone-exb text-[1.65rem] font-normal tracking-tight text-vodacom-black sm:text-3xl">
              Expériences & parcours
            </h2>
          </div>
          <p className="font-vodafone-lt text-sm leading-relaxed text-vodacom-black/60 sm:max-w-md">
            Confirmez votre identité par e-mail ou SMS pour ouvrir votre
            invitation personnelle.
          </p>
        </div>

        <ExperienceCardsSection />

        <aside className="relative mt-8 min-h-[240px] overflow-hidden rounded-2xl shadow-lg ring-1 ring-vodacom-black/10 sm:mt-10 sm:min-h-[220px]">
          <Image
            src={PLATFORM_ORGANIZER_BG_URL}
            alt=""
            fill
            unoptimized
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 1152px"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-vodacom-black/95 via-vodacom-black/82 to-vodacom-black/35 sm:bg-gradient-to-r sm:from-vodacom-black/92 sm:via-vodacom-black/78 sm:to-vodacom-black/50"
            aria-hidden
          />
          <div className="relative z-10 flex min-h-[240px] flex-col justify-end p-5 sm:min-h-0 sm:justify-center sm:p-8">
            <p className="font-vodafone-rg-bd text-xs uppercase tracking-wide text-vodacom-red">
              Vodacom Golf 2026
            </p>
            <p className="mt-1 font-vodafone-exb text-xl font-normal text-white sm:text-xl">
              {EVENT.organizer}
            </p>
            <p className="mt-2 font-vodafone-lt text-sm text-white/65 sm:mt-3">
              Une question sur votre invitation ?
            </p>
            <ul className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-6">
              <li>
                <ContactTapLink
                  href={`mailto:${EVENT.contactEmail}`}
                  icon={Mail}
                  label={EVENT.contactEmail}
                />
              </li>
              <li>
                <ContactTapLink
                  href={`tel:${EVENT.contactPhone.replace(/\s/g, "")}`}
                  icon={Phone}
                  label={EVENT.contactPhone}
                />
              </li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="border-t border-vodacom-silver/25 bg-white px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-6">
        <p className="mx-auto max-w-6xl text-center font-vodafone-lt text-[11px] leading-relaxed text-vodacom-black/50 sm:text-xs">
          © {new Date().getFullYear()} {EVENT.organizer} — {EVENT.title}
        </p>
      </footer>
    </div>
    </>
  );
}

function ContactTapLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: typeof Mail;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex min-h-[3rem] items-center gap-3 rounded-xl bg-white/10 px-4 py-3 font-vodafone-rg-bd text-sm text-white ring-1 ring-white/15 transition active:bg-white/20 sm:inline-flex sm:min-h-0 sm:bg-transparent sm:px-0 sm:py-0 sm:ring-0 sm:hover:underline"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-vodacom-red text-white sm:hidden">
        <LucideIcon icon={icon} size={18} />
      </span>
      <LucideIcon icon={icon} size={16} className="hidden shrink-0 text-vodacom-red sm:block" />
      <span className="min-w-0 break-all leading-snug">{label}</span>
    </a>
  );
}
