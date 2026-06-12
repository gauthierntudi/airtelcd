"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { PhoneDialPad } from "@/components/privilege/PhoneDialPad";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  isPrivilegeDialCodeComplete,
  PRIVILEGE_DIAL_CODE,
} from "@/lib/privilege-onboarding";

type Props = {
  open: boolean;
  onClose: () => void;
  onCodeMatched: () => void;
};

export function PrivilegeDialerModal({ open, onClose, onCodeMatched }: Props) {
  const [mounted, setMounted] = useState(false);
  const [dialed, setDialed] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setDialed("");
      setError(null);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  function handleDial() {
    if (isPrivilegeDialCodeComplete(dialed)) {
      setError(null);
      onCodeMatched();
      return;
    }
    setError(`Composez ${PRIVILEGE_DIAL_CODE} pour continuer.`);
  }

  return createPortal(
    <div className="fixed inset-0 z-[64] flex flex-col overflow-hidden font-vodafone-lt text-white">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 0%, #c40000 0%, #8b0000 42%, #1a1a1a 100%)",
        }}
      />
      <div className="relative flex min-h-full flex-col">
        <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8">
          <VodacomLogo variant="white" height={34} />
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 transition hover:bg-white/15"
            aria-label="Fermer"
          >
            <LucideIcon icon={X} size={20} />
          </button>
        </header>

        <div className="flex flex-1 flex-col justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
          <div className="mx-auto w-full max-w-md text-center">
            <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.22em] text-white/70">
              Vodacom Privilège
            </p>
            <h1 className="mt-2 font-vodafone-exb text-[1.65rem] font-normal leading-tight sm:text-3xl">
              Composer le code USSD
            </h1>
            <p className="mt-2 font-vodafone-lt text-sm text-white/75">
              Tapez <span className="font-vodafone-rg-bd">{PRIVILEGE_DIAL_CODE}</span>{" "}
              pour activer l&apos;expérience.
            </p>
          </div>

          <div className="experience-profile-enter mx-auto mt-8 w-full max-w-sm">
            <PhoneDialPad
              value={dialed}
              onChange={(value) => {
                setDialed(value);
                setError(null);
                if (isPrivilegeDialCodeComplete(value)) {
                  onCodeMatched();
                }
              }}
              onDial={handleDial}
              error={error}
              hint={`Code : ${PRIVILEGE_DIAL_CODE}`}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
