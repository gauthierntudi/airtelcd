"use client";

import { Wifi, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { LucideIcon } from "@/components/ui/lucide-icon";

type Props = {
  open: boolean;
  memberNumber: string;
  onClose: () => void;
  onContinue: () => void;
};

const NODES = [
  {
    id: "sms",
    label: "SMS",
    sub: "Illimités",
    className: "business-connectivity-pos-1",
    size: "sm" as const,
    bg: "bg-white border-2 border-slate-200 text-slate-700",
  },
  {
    id: "digital",
    label: "Expérience digitale",
    className: "business-connectivity-pos-2",
    size: "lg" as const,
    bg: "bg-slate-900 text-white",
  },
  {
    id: "p2p",
    label: "P2P",
    className: "business-connectivity-pos-3",
    size: "sm" as const,
    bg: "bg-vodacom-red text-white",
  },
  {
    id: "network",
    label: "Réseau Business",
    className: "business-connectivity-pos-4",
    size: "lg" as const,
    bg: "bg-indigo-600 text-white",
  },
  {
    id: "transfert",
    label: "Transfert",
    className: "business-connectivity-pos-5",
    size: "md" as const,
    bg: "bg-white border-2 border-slate-200 text-slate-800",
  },
  {
    id: "members",
    label: "Membres Privilège",
    className: "business-connectivity-pos-6",
    size: "xl" as const,
    bg: "bg-amber-500 text-white",
    highlight: true,
  },
  {
    id: "visa",
    label: "VISA",
    sub: "Roaming",
    className: "business-connectivity-pos-7",
    size: "sm" as const,
    bg: "bg-blue-600 text-white",
  },
  {
    id: "appels",
    label: "Appels",
    className: "business-connectivity-pos-8",
    size: "md" as const,
    bg: "bg-slate-100 border border-slate-300 text-slate-600",
  },
] as const;

const NODE_SIZE = {
  sm: "h-14 w-14 text-[9px]",
  md: "h-16 w-16 text-[9px]",
  lg: "h-20 w-20 text-[10px]",
  xl: "h-24 w-24 text-[11px]",
} as const;

export function BusinessConnectivityScreen({
  open,
  memberNumber,
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
    <div className="fixed inset-0 z-[68] overflow-y-auto bg-vodacom-cream font-vodafone-lt text-vodacom-black">
      <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col items-center justify-center overflow-hidden rounded-none bg-white p-4 shadow-xl sm:min-h-0 sm:my-4 sm:rounded-3xl sm:border sm:border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 sm:right-6 sm:top-6"
          aria-label="Fermer"
        >
          <LucideIcon icon={X} size={20} />
        </button>

        <header className="absolute top-10 z-20 px-4 text-center sm:top-12">
          <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.28em] text-vodacom-red sm:text-xs">
            Connectivité illimitée
          </p>
          <h1 className="mt-2 font-vodafone-exb text-2xl font-normal text-slate-800 sm:text-4xl">
            Le privilège de rester connecté
          </h1>
          <p className="mt-2 font-vodafone-lt text-sm text-slate-500 sm:text-base">
            Membre ajouté · {memberNumber}
          </p>
        </header>

        <div className="relative mt-28 flex h-[min(560px,62vh)] w-full items-center justify-center sm:mt-32 sm:h-[600px]">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <circle
              cx="400"
              cy="300"
              r="140"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <circle
              cx="400"
              cy="300"
              r="230"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <circle
              cx="400"
              cy="300"
              r="300"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="1"
            />
            <g
              className="business-connectivity-line-dash"
              stroke="#cbd5e1"
              strokeWidth="1"
            >
              <line x1="400" y1="300" x2="400" y2="100" />
              <line x1="400" y1="300" x2="650" y2="150" />
              <line x1="400" y1="300" x2="720" y2="300" />
              <line x1="400" y1="300" x2="650" y2="450" />
              <line x1="400" y1="300" x2="400" y2="520" />
              <line x1="400" y1="300" x2="150" y2="450" />
              <line x1="400" y1="300" x2="80" y2="300" />
              <line x1="400" y1="300" x2="150" y2="150" />
            </g>
          </svg>

          <div className="business-connectivity-hub absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="relative flex items-center justify-center">
              <div className="business-connectivity-pulse absolute h-36 w-36 rounded-full bg-vodacom-red/15 sm:h-40 sm:w-40" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-vodacom-red shadow-2xl sm:h-28 sm:w-28">
                <LucideIcon icon={Wifi} size={40} className="text-white" />
              </div>
            </div>
          </div>

          <div className="relative h-full w-full max-w-3xl">
            {NODES.map((node) => (
              <div
                key={node.id}
                className={`business-connectivity-node absolute -translate-x-1/2 -translate-y-1/2 ${node.className}`}
              >
                <div
                  className={`flex flex-col items-center justify-center rounded-full p-2 text-center font-vodafone-exb uppercase leading-tight tracking-wide shadow-md ${NODE_SIZE[node.size]} ${node.bg} ${
                    "highlight" in node && node.highlight
                      ? "ring-4 ring-vodacom-red/30"
                      : ""
                  }`}
                >
                  <span className="max-w-[92%] font-bold leading-tight">
                    {node.label}
                  </span>
                  {"sub" in node && node.sub ? (
                    <span className="mt-1 text-[8px] font-vodafone-lt font-normal normal-case tracking-normal text-white/80">
                      {node.sub}
                    </span>
                  ) : null}
                </div>
                {node.id === "members" ? (
                  <p className="mt-2 max-w-[7rem] text-center text-[9px] font-vodafone-rg-bd text-vodacom-red">
                    {memberNumber}
                  </p>
                ) : null}
              </div>
            ))}

            <div className="business-connectivity-float-a absolute">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-lime-500 text-[8px] font-vodafone-exb uppercase text-white shadow-lg">
                Data
              </div>
            </div>
            <div className="business-connectivity-float-b absolute">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-800 text-[8px] font-vodafone-exb uppercase text-white shadow-lg">
                5G
              </div>
            </div>
          </div>
        </div>

        <footer className="absolute bottom-8 z-20 flex w-full flex-col items-center px-4 sm:bottom-12">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-full bg-vodacom-red px-12 py-4 font-vodafone-rg-bd text-lg text-white shadow-lg transition hover:bg-[#c40000] active:scale-[0.98]"
          >
            Continuer
          </button>
          <div className="mt-6 flex items-center gap-2 opacity-60">
            <VodacomLogo variant="black" height={22} />
            <p className="font-vodafone-lt text-xs text-slate-400">
              Accès réservé aux abonnés Privilège enregistrés
            </p>
          </div>
        </footer>
      </main>
    </div>,
    document.body,
  );
}
