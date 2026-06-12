"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { LucideIcon } from "@/components/ui/lucide-icon";

const LOADER_Z_INDEX = 10000;

type Props = {
  open: boolean;
};

export function PrivilegeForfaitActivationLoader({ open }: Props) {
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
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-6 font-vodafone-lt text-white"
      style={{
        zIndex: LOADER_Z_INDEX,
        background:
          "radial-gradient(ellipse 120% 90% at 50% 0%, #c40000 0%, #8b0000 42%, #1a1a1a 100%)",
      }}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <VodacomLogo variant="white" height={36} />
      <LucideIcon
        icon={Loader2}
        size={44}
        className="mt-10 animate-spin text-white/90"
      />
      <p className="mt-6 font-vodafone-rg-bd text-sm uppercase tracking-[0.2em] text-white/85">
        Activation du forfait
      </p>
      <p className="mt-2 max-w-xs text-center font-vodafone-lt text-sm leading-relaxed text-white/60">
        Activation en cours…
      </p>
    </div>,
    document.body,
  );
}
