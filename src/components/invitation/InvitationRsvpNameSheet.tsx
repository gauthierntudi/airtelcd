"use client";

import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { InvitationBottomSheet } from "@/components/invitation/InvitationBottomSheet";
import { LucideIcon } from "@/components/ui/lucide-icon";

export type RsvpNamePayload = {
  fullName?: string;
};

type Props = {
  loading: boolean;
  onClose: () => void;
  onSubmit: (names: RsvpNamePayload) => void;
};

/** Bottom sheet — nom complet requis avant confirmation si absent en base */
export function InvitationRsvpNameSheet({ loading, onClose, onSubmit }: Props) {
  const [fullName, setFullName] = useState("");
  const trimmed = fullName.trim();
  const canSubmit = trimmed.length > 0 && !loading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ fullName: trimmed });
  }

  return (
    <InvitationBottomSheet
      onClose={onClose}
      titleId="rsvp-name-title"
      backdropLabel="Fermer"
      tone="light"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-0">
          <h2
            id="rsvp-name-title"
            className="font-vodafone-exb text-xl leading-tight text-zinc-900"
          >
            Votre identité
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 active:bg-zinc-200"
          >
            <LucideIcon icon={X} size={20} />
          </button>
        </header>

        <div className="px-5 pb-4">
          <p className="text-sm leading-relaxed text-zinc-500">
            Indiquez votre nom complet pour confirmer votre présence.
          </p>

          <label htmlFor="rsvp-full-name" className="mt-4 block">
            <span className="text-sm font-semibold text-zinc-800">
              Nom complet *
            </span>
            <input
              id="rsvp-full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              placeholder="Jean Dupont"
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/15"
            />
          </label>
        </div>

        <div className="shrink-0 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-vodacom-red text-base font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading && (
              <LucideIcon icon={Loader2} size={20} className="animate-spin" />
            )}
            {loading ? "Confirmation…" : "Confirmer ma présence"}
          </button>
        </div>
      </form>
    </InvitationBottomSheet>
  );
}
