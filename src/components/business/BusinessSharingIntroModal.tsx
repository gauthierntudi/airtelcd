"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { EXPERIENCE_PROFILE_COPY } from "@/lib/experience-profile";

type Props = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
};

export function BusinessSharingIntroModal({
  open,
  onClose,
  onContinue,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[66] flex flex-col overflow-hidden bg-gradient-to-b from-vodacom-black via-[#1a1a1a] to-[#0d0d0d] font-vodafone-lt text-white">
      <header className="relative z-20 flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8">
        <VodacomLogo variant="white" height={34} />
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/15 active:scale-95"
          aria-label="Fermer"
        >
          <LucideIcon icon={X} size={20} />
        </button>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center sm:px-12">
        <p className="font-vodafone-rg-bd text-[10px] capitalize tracking-[0.35em] text-white/55 sm:text-xs">
          Profil {EXPERIENCE_PROFILE_COPY.BUSINESS.title}
        </p>
        <h1 className="mt-8 max-w-xl font-vodafone-exb text-[1.65rem] font-normal leading-[1.35] tracking-[0.12em] text-white sm:mt-10 sm:text-[2.15rem] sm:leading-[1.4] sm:tracking-[0.14em]">
          Vous pouvez partager votre forfait avec votre famille.
        </h1>
      </div>

      <footer className="relative z-20 shrink-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-8">
        <button
          type="button"
          onClick={onContinue}
          className="mx-auto flex w-full max-w-md items-center justify-center rounded-2xl bg-white py-3.5 font-vodafone-rg-bd text-base text-vodacom-red shadow-lg transition active:scale-[0.98]"
        >
          Continuer
        </button>
      </footer>
    </div>,
    document.body,
  );
}
