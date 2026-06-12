"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PrivilegeOptInUssdSimulator } from "@/components/privilege/PrivilegeOptInUssdSimulator";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { MPESA_USSD_COLORS, MPESA_USSD_Z_INDEX } from "@/lib/mpesa-ussd/theme";

type Props = {
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
  onConfirmed: () => void;
};

export function PrivilegeOptInUssdModal({
  open,
  onClose,
  onCancel,
  onConfirmed,
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
    <div
      className="fixed inset-0 flex min-h-[100dvh] flex-col bg-vodacom-black"
      style={{ zIndex: MPESA_USSD_Z_INDEX }}
      role="dialog"
      aria-modal="true"
    >
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <div>
          <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.2em] text-vodacom-red">
            Menu interactif
          </p>
          <h2 className="font-vodafone-exb text-lg font-normal text-white">
            Vodacom Privilège — Opt-In
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            onCancel();
            onClose();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15"
          aria-label="Fermer"
        >
          <LucideIcon icon={X} size={20} />
        </button>
      </header>

      <div
        className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden"
        style={{ backgroundColor: MPESA_USSD_COLORS.dark }}
      >
        <PrivilegeOptInUssdSimulator
          key={open ? "open" : "closed"}
          onClose={onClose}
          onCancel={onCancel}
          onConfirmed={onConfirmed}
        />
      </div>
    </div>,
    document.body,
  );
}
