"use client";

import { Briefcase, Loader2, Plane, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  EXPERIENCE_PROFILE_COPY,
  EXPERIENCE_PROFILE_ORBIT_RADIUS,
  EXPERIENCE_PROFILES,
  type ExperienceProfile,
} from "@/lib/experience-profile";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (profile: ExperienceProfile) => void;
};

const PROFILE_ICONS = {
  TRAVELER: Plane,
  BUSINESS: Briefcase,
} as const;

export function ExperienceProfileModal({ open, onClose, onSelect }: Props) {
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<ExperienceProfile | null>(null);
  const [continuing, setContinuing] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setContinuing(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  async function handleContinue() {
    if (!selected || continuing) return;
    setContinuing(true);
    try {
      onSelect(selected);
    } finally {
      setContinuing(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[65] overflow-hidden font-vodafone-lt text-white">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 0%, #c40000 0%, #8b0000 42%, #1a1a1a 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 bottom-40 h-48 w-48 rounded-full bg-[#e60000]/30 blur-3xl"
        aria-hidden
      />

      <div className="relative flex min-h-full flex-col">
        <header className="experience-profile-enter flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8">
          <VodacomLogo variant="white" height={34} />
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/15 active:scale-95"
            aria-label="Fermer"
          >
            <LucideIcon icon={X} size={20} />
          </button>
        </header>

        <section className="experience-profile-enter shrink-0 px-4 pt-2 text-center sm:px-8">
          <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.22em] text-white/70 sm:text-xs">
            Kinshasa Open de Golf
          </p>
          <h1
            id="experience-profile-title"
            className="mt-2 font-vodafone-exb text-[1.65rem] font-normal leading-tight tracking-tight sm:text-3xl"
          >
            Choisissez votre profil
          </h1>
          <p className="mt-1.5 font-vodafone-lt text-sm text-white/75 sm:text-base">
            Personnalisez votre parcours à l&apos;événement.
          </p>
        </section>

        <div className="flex min-h-0 flex-1 flex-col justify-center px-4 sm:px-8">
          <div
            role="list"
            aria-labelledby="experience-profile-title"
            className="experience-profile-enter relative mx-auto aspect-square w-full max-w-[min(94vw,30rem)] overflow-visible sm:max-w-2xl"
          >
            <div className="absolute inset-[2%] overflow-visible">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/20"
                style={{
                  width: `${EXPERIENCE_PROFILE_ORBIT_RADIUS * 2}%`,
                  height: `${EXPERIENCE_PROFILE_ORBIT_RADIUS * 2}%`,
                }}
                aria-hidden
              />

              {EXPERIENCE_PROFILES.map((profile, index) => (
                <ProfileOrbitNode
                  key={profile}
                  profile={profile}
                  selected={selected === profile}
                  index={index}
                  onSelect={setSelected}
                />
              ))}

              <div className="absolute left-1/2 top-1/2 z-10 flex h-[4.75rem] w-[4.75rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.35)] ring-4 ring-[#e60000] sm:h-[5.5rem] sm:w-[5.5rem]">
                <Image
                  src="/img/kekekeke.jpg"
                  alt=""
                  width={88}
                  height={88}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

        </div>

        <footer
          className={`shrink-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 transition-all duration-300 sm:px-8 ${
            selected
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={() => void handleContinue()}
            disabled={!selected || continuing}
            className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-white py-3.5 font-vodafone-rg-bd text-base text-vodacom-red shadow-lg transition active:scale-[0.98] disabled:opacity-60"
          >
            {continuing && (
              <LucideIcon icon={Loader2} size={20} className="animate-spin" />
            )}
            {continuing
              ? "Ouverture…"
              : selected
                ? `Continuer en tant que ${EXPERIENCE_PROFILE_COPY[selected].title}`
                : "Continuer"}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function ProfileOrbitNode({
  profile,
  selected,
  index,
  onSelect,
}: {
  profile: ExperienceProfile;
  selected: boolean;
  index: number;
  onSelect: (profile: ExperienceProfile) => void;
}) {
  const copy = EXPERIENCE_PROFILE_COPY[profile];
  const Icon = PROFILE_ICONS[profile];
  const rad = (copy.orbitAngleDeg * Math.PI) / 180;
  const left = 50 + Math.cos(rad) * EXPERIENCE_PROFILE_ORBIT_RADIUS;
  const top = 50 + Math.sin(rad) * EXPERIENCE_PROFILE_ORBIT_RADIUS;

  return (
    <button
      type="button"
      role="listitem"
      aria-pressed={selected}
      onClick={() => onSelect(profile)}
      className="experience-profile-card absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${120 + index * 100}ms`,
      }}
    >
      <span
        className={`flex h-[7.25rem] w-[7.25rem] flex-col items-center justify-center rounded-full p-3 text-center text-white shadow-[0_10px_32px_rgba(0,0,0,0.28)] ring-4 transition duration-300 sm:h-[8.25rem] sm:w-[8.25rem] ${
          selected
            ? "scale-105 ring-white"
            : "ring-white/35 hover:scale-[1.03] hover:ring-white/60"
        }`}
        style={{ background: copy.circleBg }}
      >
        <LucideIcon icon={Icon} size={26} className="shrink-0" />
        <span className="mt-2 font-vodafone-exb text-[11px] font-normal uppercase leading-tight tracking-wide sm:text-xs">
          {copy.title}
        </span>
      </span>
      <span
        className={`mt-3 max-w-[10.5rem] text-center font-vodafone-rg-bd text-sm leading-snug [text-shadow:0_1px_8px_rgba(0,0,0,0.55)] transition sm:max-w-[12rem] sm:text-base ${
          selected ? "text-white" : "text-white/95"
        }`}
      >
        {copy.description}
      </span>
    </button>
  );
}
