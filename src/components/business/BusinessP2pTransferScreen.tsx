"use client";

import { Loader2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { TravelerMoneyTransferAnimation } from "@/components/traveler/TravelerMoneyTransferAnimation";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { EXPERIENCE_PROFILE_COPY } from "@/lib/experience-profile";

type View = "intro" | "transfer";

type Props = {
  open: boolean;
  memberNumber: string;
  onClose: () => void;
  onComplete: () => void;
};

export function BusinessP2pTransferScreen({
  open,
  memberNumber,
  onClose,
  onComplete,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<View>("intro");
  const [transferDone, setTransferDone] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setView("intro");
      setTransferDone(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const transferInProgress = view === "transfer" && !transferDone;
  const memberLabel = memberNumber;

  function handleFooterClick() {
    if (view === "intro") {
      setView("transfer");
      return;
    }
    if (transferDone) {
      onComplete();
    }
  }

  const footerLabel =
    view === "intro"
      ? "Envoyer le transfert P2P"
      : transferInProgress
        ? "Transfert en cours…"
        : "Terminer";

  return createPortal(
    <div className="fixed inset-0 z-[69] flex flex-col overflow-hidden font-vodafone-lt text-white">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 0%, #c40000 0%, #8b0000 42%, #1a1a1a 100%)",
        }}
        aria-hidden
      />

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

      <section className="relative z-10 shrink-0 px-4 pt-1 text-center sm:px-8">
        <p className="font-vodafone-rg-bd text-[10px] capitalize tracking-[0.22em] text-white/70 sm:text-xs">
          Profil {EXPERIENCE_PROFILE_COPY.BUSINESS.title} · Transfert P2P
        </p>
        <h1 className="mt-2 font-vodafone-exb text-[1.5rem] font-normal leading-tight tracking-tight sm:text-[1.85rem]">
          Partagez vos crédits P2P
        </h1>
      </section>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="experience-profile-enter mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center">
          {view === "intro" ? (
            <div className="w-full rounded-[1.75rem] border border-white/15 bg-white/5 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.28)] sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-vodacom-red/25 ring-1 ring-vodacom-red/35">
                  <LucideIcon icon={Users} size={22} className="text-white" />
                </span>
                <div>
                  <p className="font-vodafone-exb text-base sm:text-lg">
                    Membre du forfait
                  </p>
                  <p className="font-vodafone-rg-bd text-sm text-[#5eead4]">
                    {memberLabel}
                  </p>
                </div>
              </div>
              <p className="mt-5 font-vodafone-lt text-sm leading-relaxed text-white/80 sm:text-base">
                Envoyez une partie de vos crédits P2P Privilège à votre proche
                pour qu&apos;il reste connecté avec vous.
              </p>
            </div>
          ) : (
            <TravelerMoneyTransferAnimation
              senderLabel="Vous"
              receiverLabel={memberLabel}
              amount="12 $"
              onComplete={() => setTransferDone(true)}
            />
          )}
        </div>
      </div>

      <footer
        className={`relative z-20 mt-auto shrink-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 transition-all duration-300 sm:px-8 ${
          transferInProgress
            ? "pointer-events-none translate-y-4 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={handleFooterClick}
          disabled={view === "transfer" && !transferDone}
          className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-white py-3.5 font-vodafone-rg-bd text-base text-vodacom-red shadow-lg transition active:scale-[0.98] disabled:opacity-60"
        >
          {transferInProgress && (
            <LucideIcon icon={Loader2} size={20} className="animate-spin" />
          )}
          {footerLabel}
        </button>
      </footer>
    </div>,
    document.body,
  );
}
