"use client";

import { MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LucideIcon } from "@/components/ui/lucide-icon";

export type SimulatedSmsMessage = {
  id: string;
  body: string;
  sender?: string;
};

type Props = {
  open: boolean;
  messages: SimulatedSmsMessage[];
  onClose: () => void;
  onComplete: () => void;
};

export function SimulatedSmsModal({
  open,
  messages,
  onClose,
  onComplete,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setIndex(0);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted || messages.length === 0) return null;

  const current = messages[index];
  const isLast = index >= messages.length - 1;

  function handleNext() {
    if (isLast) {
      onComplete();
      return;
    }
    setIndex((i) => i + 1);
  }

  return createPortal(
    <div className="fixed inset-0 z-[72] flex flex-col bg-[#0b0b0c] font-vodafone-lt text-white">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <LucideIcon icon={MessageSquare} size={18} className="text-vodacom-red" />
          <p className="font-vodafone-rg-bd text-sm">Messages reçus</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
          aria-label="Fermer"
        >
          <LucideIcon icon={X} size={18} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#1c1c1e] p-4 shadow-2xl">
          <p className="text-center font-vodafone-lt text-xs text-white/45">
            {index + 1} / {messages.length}
          </p>
          <div className="mt-4 rounded-2xl bg-[#2c2c2e] px-4 py-3">
            <p className="font-vodafone-rg-bd text-xs text-vodacom-red">
              {current.sender ?? "Vodacom"}
            </p>
            <p className="mt-2 font-vodafone-lt text-sm leading-relaxed text-white/90">
              {current.body}
            </p>
          </div>
        </div>
      </div>

      <footer className="shrink-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-8">
        <button
          type="button"
          onClick={handleNext}
          className="mx-auto flex w-full max-w-md items-center justify-center rounded-2xl bg-white py-3.5 font-vodafone-rg-bd text-base text-vodacom-red shadow-lg transition active:scale-[0.98]"
        >
          {isLast ? "Continuer" : "Message suivant"}
        </button>
      </footer>
    </div>,
    document.body,
  );
}
